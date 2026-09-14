import { Request, Response } from 'express';
import { z } from 'zod';
import { query, pool } from '../config/db';
import { SeatService } from '../services/seatService';
import { PlannerService } from '../services/plannerService';
import { Schedule } from '../models/types';

const registerCourseSchema = z.object({
  sectionId: z.number().int().positive('Valid section ID is required'),
  studentId: z.number().int().positive().optional()
});

export class RegistrationController {
  /**
   * Register a student for a course section
   * Strictly enforces: Prerequisite check, Duplicate check, Credit limit, Time collisions, Seat availability, Concurrency
   */
  public static async register(req: Request, res: Response): Promise<void> {
    const data = registerCourseSchema.parse(req.body);

    // Determine target student ID
    const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : data.studentId;

    if (!studentId) {
      res.status(400).json({ success: false, error: 'Student ID could not be identified.' });
      return;
    }

    // 1. Fetch section and course info
    const secRes = await query(
      `SELECT cs.id as section_id, cs.section_code, cs.max_capacity,
              c.id as course_id, c.code as course_code, c.name as course_name, c.credits
       FROM course_sections cs
       JOIN courses c ON c.id = cs.course_id
       WHERE cs.id = $1`,
      [data.sectionId]
    );

    if (secRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Course section not found.' });
      return;
    }
    const section = secRes.rows[0];

    // 2. Fetch student profile and credit limit
    const studentRes = await query(
      'SELECT id, semester, max_credits FROM students WHERE id = $1',
      [studentId]
    );
    if (studentRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Student profile not found.' });
      return;
    }
    const student = studentRes.rows[0];

    // 3. Rule: Check if student already completed this course
    const completedRes = await query(
      'SELECT id FROM completed_courses WHERE student_id = $1 AND course_id = $2',
      [studentId, section.course_id]
    );
    if (completedRes.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: `Cannot register: You have already completed ${section.course_code} in a previous semester.`
      });
      return;
    }

    // 4. Rule: Check if student is already registered for this course (any section)
    const existingEnrollment = await query(
      `SELECT e.id, cs.section_code, c.code as course_code
       FROM enrollments e
       JOIN course_sections cs ON cs.id = e.section_id
       JOIN courses c ON c.id = cs.course_id
       WHERE e.student_id = $1 AND c.id = $2 AND e.status = 'REGISTERED'`,
      [studentId, section.course_id]
    );
    if (existingEnrollment.rows.length > 0) {
      res.status(409).json({
        success: false,
        error: `You are already registered for ${section.course_code} (${existingEnrollment.rows[0].section_code}). Duplicate registration is not permitted.`
      });
      return;
    }

    // 5. Rule: Check Prerequisites
    const prereqCheck = await PlannerService.checkPrerequisites(studentId, [section.course_id]);
    const coursePrereq = prereqCheck[0];
    if (coursePrereq && !coursePrereq.satisfied) {
      res.status(400).json({
        success: false,
        error: `Prerequisite requirement not satisfied! You must complete: ${coursePrereq.missingPrereqs.join(', ')} before registering for ${section.course_code}.`
      });
      return;
    }

    // 6. Rule: Check Credit Limit
    const currentCreditsRes = await query<{ total: string }>(
      `SELECT COALESCE(SUM(c.credits), 0) as total
       FROM enrollments e
       JOIN course_sections cs ON cs.id = e.section_id
       JOIN courses c ON c.id = cs.course_id
       WHERE e.student_id = $1 AND e.status = 'REGISTERED'`,
      [studentId]
    );
    const currentCredits = parseInt(currentCreditsRes.rows[0].total, 10);
    if (currentCredits + section.credits > student.max_credits) {
      res.status(400).json({
        success: false,
        error: `Credit limit exceeded! Current: ${currentCredits} credits, Course: ${section.credits} credits. Max allowed: ${student.max_credits} credits.`
      });
      return;
    }

    // 7. Rule: Check Time Collision with existing registered courses
    const registeredSectionsRes = await query<{ section_id: number }>(
      `SELECT section_id FROM enrollments WHERE student_id = $1 AND status = 'REGISTERED'`,
      [studentId]
    );
    const existingSectionIds = registeredSectionsRes.rows.map((r) => r.section_id);

    if (existingSectionIds.length > 0) {
      const conflictCheck = await PlannerService.checkConflicts([...existingSectionIds, section.section_id]);
      if (conflictCheck.hasConflicts) {
        const firstConflict = conflictCheck.conflicts[0];
        res.status(409).json({
          success: false,
          error: `Schedule collision detected! ${firstConflict.course1.code} (${firstConflict.course1.time}) overlaps with ${firstConflict.course2.code} (${firstConflict.course2.time}).`,
          conflict: firstConflict
        });
        return;
      }
    }

    // 8. Rule: Concurrency Safe Seat Reservation via Redis
    const reservation = await SeatService.reserveSeat(studentId, section.section_id);
    if (!reservation.success) {
      res.status(409).json({
        success: false,
        error: reservation.message || 'Course section is full.'
      });
      return;
    }

    // 9. Persist in PostgreSQL within database transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if dropped record exists to reuse or insert new
      const checkRes = await client.query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND section_id = $2',
        [studentId, section.section_id]
      );

      let enrollmentId: number;
      if (checkRes.rows.length > 0) {
        const updateRes = await client.query(
          `UPDATE enrollments
           SET status = 'REGISTERED', enrolled_at = CURRENT_TIMESTAMP, dropped_at = NULL
           WHERE id = $1
           RETURNING id`,
          [checkRes.rows[0].id]
        );
        enrollmentId = updateRes.rows[0].id;
      } else {
        const insertRes = await client.query(
          `INSERT INTO enrollments (id, student_id, section_id, status, enrolled_at)
           VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM enrollments), $1, $2, 'REGISTERED', CURRENT_TIMESTAMP)
           RETURNING id`,
          [studentId, section.section_id]
        );
        enrollmentId = insertRes.rows[0].id;
      }

      // Log in audit table
      await client.query(
        `INSERT INTO registration_logs (id, student_id, course_id, section_id, action, details)
         VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM registration_logs), $1, $2, $3, 'REGISTER', $4)`,
        [
          studentId,
          section.course_id,
          section.section_id,
          JSON.stringify({
            courseCode: section.course_code,
            sectionCode: section.section_code,
            credits: section.credits,
            registeredAt: new Date().toISOString()
          })
        ]
      );

      await client.query('COMMIT');

      // Release lock
      await SeatService.releaseLock(studentId, section.section_id);

      // Get updated seat count
      const seatInfo = await SeatService.getAvailableSeats(section.section_id);

      res.status(201).json({
        success: true,
        message: `Successfully registered for ${section.course_code} - ${section.course_name} (${section.section_code})!`,
        enrollment: {
          id: enrollmentId,
          courseCode: section.course_code,
          courseName: section.course_name,
          sectionCode: section.section_code,
          credits: section.credits,
          availableSeats: seatInfo.available,
          seatStatus: seatInfo.status
        }
      });
    } catch (dbErr: any) {
      await client.query('ROLLBACK');
      // Rollback Redis seat decrement
      await SeatService.releaseSeat(section.section_id);
      await SeatService.releaseLock(studentId, section.section_id);
      throw dbErr;
    } finally {
      client.release();
    }
  }

  /**
   * Drop a registered course
   * Updates PostgreSQL status to DROPPED and increments Redis seat count
   */
  public static async drop(req: Request, res: Response): Promise<void> {
    const enrollmentId = parseInt(req.params.id as string, 10);
    if (isNaN(enrollmentId)) {
      res.status(400).json({ success: false, error: 'Invalid enrollment ID' });
      return;
    }

    const studentId = req.user?.studentId;

    // Fetch enrollment
    const enrRes = await query(
      `SELECT e.id, e.student_id, e.section_id, e.status,
              cs.course_id, c.code as course_code, c.name as course_name, cs.section_code
       FROM enrollments e
       JOIN course_sections cs ON cs.id = e.section_id
       JOIN courses c ON c.id = cs.course_id
       WHERE e.id = $1`,
      [enrollmentId]
    );

    if (enrRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Registration record not found.' });
      return;
    }
    const enrollment = enrRes.rows[0];

    // Authorization check
    if (req.user?.role === 'STUDENT' && enrollment.student_id !== studentId) {
      res.status(403).json({ success: false, error: 'You are not authorized to drop this course.' });
      return;
    }

    if (enrollment.status === 'DROPPED') {
      res.status(400).json({ success: false, error: 'This course is already dropped.' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update enrollment
      await client.query(
        `UPDATE enrollments
         SET status = 'DROPPED', dropped_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [enrollmentId]
      );

      // Audit log
      await client.query(
        `INSERT INTO registration_logs (id, student_id, course_id, section_id, action, details)
         VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM registration_logs), $1, $2, $3, 'DROP', $4)`,
        [
          enrollment.student_id,
          enrollment.course_id,
          enrollment.section_id,
          JSON.stringify({
            courseCode: enrollment.course_code,
            sectionCode: enrollment.section_code,
            droppedAt: new Date().toISOString()
          })
        ]
      );

      await client.query('COMMIT');

      // Increment available seats in Redis
      await SeatService.releaseSeat(enrollment.section_id);

      const seatInfo = await SeatService.getAvailableSeats(enrollment.section_id);

      res.json({
        success: true,
        message: `Successfully dropped ${enrollment.course_code} (${enrollment.section_code}). Seat has been released.`,
        availableSeats: seatInfo.available,
        seatStatus: seatInfo.status
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Get all active enrollments for a student
   */
  public static async getStudentRegistrations(req: Request, res: Response): Promise<void> {
    const studentIdParam = parseInt(req.params.studentId as string, 10);
    const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : studentIdParam;

    if (!studentId) {
      res.status(400).json({ success: false, error: 'Valid student ID is required' });
      return;
    }

    const resDb = await query(
      `SELECT e.id as enrollment_id, e.student_id, e.section_id, e.status, e.enrolled_at,
              cs.section_code, cs.faculty_name, cs.room_number, cs.max_capacity,
              c.id as course_id, c.code as course_code, c.name as course_name, c.credits, c.semester,
              d.name as department_name
       FROM enrollments e
       JOIN course_sections cs ON cs.id = e.section_id
       JOIN courses c ON c.id = cs.course_id
       JOIN departments d ON d.id = c.department_id
       WHERE e.student_id = $1 AND e.status = 'REGISTERED'
       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );

    const sectionIds = resDb.rows.map((r) => r.section_id);
    let schedules: Schedule[] = [];

    if (sectionIds.length > 0) {
      const schedRes = await query<Schedule>(
        'SELECT id, section_id, day_of_week, start_time, end_time, building, room FROM schedules WHERE section_id = ANY($1::int[])',
        [sectionIds]
      );
      schedules = schedRes.rows;
    }

    const schedulesBySection = new Map<number, Schedule[]>();
    for (const s of schedules) {
      const list = schedulesBySection.get(s.section_id) || [];
      list.push(s);
      schedulesBySection.set(s.section_id, list);
    }

    const registrations = resDb.rows.map((r) => ({
      enrollmentId: r.enrollment_id,
      courseId: r.course_id,
      courseCode: r.course_code,
      courseName: r.course_name,
      credits: r.credits,
      semester: r.semester,
      departmentName: r.department_name,
      sectionId: r.section_id,
      sectionCode: r.section_code,
      facultyName: r.faculty_name,
      roomNumber: r.room_number,
      enrolledAt: r.enrolled_at,
      schedules: schedulesBySection.get(r.section_id) || []
    }));

    const totalCredits = registrations.reduce((acc, r) => acc + r.credits, 0);

    res.json({
      success: true,
      totalCredits,
      count: registrations.length,
      registrations
    });
  }

  /**
   * Get audit log history of registrations and drops for a student
   */
  public static async getHistory(req: Request, res: Response): Promise<void> {
    const studentIdParam = parseInt(req.params.studentId as string, 10);
    const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : studentIdParam;

    if (!studentId) {
      res.status(400).json({ success: false, error: 'Valid student ID is required' });
      return;
    }

    const resDb = await query(
      `SELECT rl.id, rl.student_id, rl.action, rl.details, rl.created_at,
              c.code as course_code, c.name as course_name
       FROM registration_logs rl
       LEFT JOIN courses c ON c.id = rl.course_id
       WHERE rl.student_id = $1
       ORDER BY rl.created_at DESC`,
      [studentId]
    );

    res.json({
      success: true,
      history: resDb.rows
    });
  }
}
