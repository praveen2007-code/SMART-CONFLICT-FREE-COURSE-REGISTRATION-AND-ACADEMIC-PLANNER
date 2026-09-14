import { Request, Response } from 'express';
import { query } from '../config/db';
import { SeatService } from '../services/seatService';
import { Course, CourseSection, Schedule } from '../models/types';
import { safeRedis } from '../config/redis';

export class CourseController {
  public static async getCourses(req: Request, res: Response): Promise<void> {
    const { search, department, semester, studentId } = req.query;

    let sql = `
      SELECT c.id, c.code, c.name, c.credits, c.department_id, c.semester, c.description, c.is_core,
             d.name as department_name, d.code as department_code
      FROM courses c
      JOIN departments d ON d.id = c.department_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (c.code ILIKE $${params.length} OR c.name ILIKE $${params.length} OR c.description ILIKE $${params.length})`;
    }

    if (department && department !== 'ALL') {
      params.push(department);
      sql += ` AND d.code = $${params.length}`;
    }

    if (semester && semester !== 'ALL') {
      params.push(parseInt(semester as string, 10));
      sql += ` AND c.semester = $${params.length}`;
    }

    sql += ` ORDER BY c.semester ASC, c.code ASC`;

    const coursesRes = await query(sql, params);
    const courses = coursesRes.rows;

    // Fetch completed courses if studentId is provided
    let completedCourseIds = new Set<number>();
    let registeredCourseIds = new Set<number>();

    const targetStudentId = studentId ? parseInt(studentId as string, 10) : req.user?.studentId;

    if (targetStudentId) {
      const compRes = await query<{ course_id: number }>(
        'SELECT course_id FROM completed_courses WHERE student_id = $1',
        [targetStudentId]
      );
      completedCourseIds = new Set(compRes.rows.map((r) => r.course_id));

      const regRes = await query<{ course_id: number }>(
        `SELECT cs.course_id
         FROM enrollments e
         JOIN course_sections cs ON cs.id = e.section_id
         WHERE e.student_id = $1 AND e.status = 'REGISTERED'`,
        [targetStudentId]
      );
      registeredCourseIds = new Set(regRes.rows.map((r) => r.course_id));
    }

    // Fetch all prerequisites
    const prereqsRes = await query(
      `SELECT p.course_id, p.prerequisite_course_id, pr.code as prereq_code, pr.name as prereq_name
       FROM prerequisites p
       JOIN courses pr ON pr.id = p.prerequisite_course_id`
    );

    const prereqsByCourse = new Map<number, any[]>();
    for (const p of prereqsRes.rows) {
      const list = prereqsByCourse.get(p.course_id) || [];
      const isSatisfied = completedCourseIds.has(p.prerequisite_course_id);
      list.push({
        prerequisiteCourseId: p.prerequisite_course_id,
        code: p.prereq_code,
        name: p.prereq_name,
        satisfied: isSatisfied
      });
      prereqsByCourse.set(p.course_id, list);
    }

    // Fetch all sections & schedules
    const sectionsRes = await query(
      `SELECT cs.id, cs.course_id, cs.section_code, cs.faculty_name, cs.max_capacity, cs.room_number, cs.semester_term
       FROM course_sections cs
       ORDER BY cs.section_code ASC`
    );

    const schedulesRes = await query<Schedule>(
      `SELECT id, section_id, day_of_week, start_time, end_time, building, room
       FROM schedules
       ORDER BY day_of_week, start_time`
    );

    const schedulesBySection = new Map<number, Schedule[]>();
    for (const s of schedulesRes.rows) {
      const list = schedulesBySection.get(s.section_id) || [];
      list.push(s);
      schedulesBySection.set(s.section_id, list);
    }

    // Build enriched course list
    const enrichedCourses = await Promise.all(
      courses.map(async (c) => {
        const cPrereqs = prereqsByCourse.get(c.id) || [];
        const satisfiesPrerequisites = cPrereqs.every((p) => p.satisfied);

        const cSections = sectionsRes.rows.filter((s) => s.course_id === c.id);

        const enrichedSections = await Promise.all(
          cSections.map(async (sec) => {
            const seatInfo = await SeatService.getAvailableSeats(sec.id);
            return {
              id: sec.id,
              courseId: sec.course_id,
              sectionCode: sec.section_code,
              facultyName: sec.faculty_name,
              maxCapacity: sec.max_capacity,
              roomNumber: sec.room_number,
              semesterTerm: sec.semester_term,
              availableSeats: seatInfo.available,
              seatStatus: seatInfo.status,
              schedules: schedulesBySection.get(sec.id) || []
            };
          })
        );

        // Calculate total available seats for course
        const totalSeats = enrichedSections.reduce((acc, s) => acc + s.availableSeats, 0);

        return {
          id: c.id,
          code: c.code,
          name: c.name,
          credits: c.credits,
          departmentId: c.department_id,
          departmentCode: c.department_code,
          departmentName: c.department_name,
          semester: c.semester,
          description: c.description,
          isCore: c.is_core,
          isCompleted: completedCourseIds.has(c.id),
          isRegistered: registeredCourseIds.has(c.id),
          satisfiesPrerequisites,
          prerequisites: cPrereqs,
          totalAvailableSeats: totalSeats,
          sections: enrichedSections
        };
      })
    );

    res.json({
      success: true,
      count: enrichedCourses.length,
      courses: enrichedCourses
    });
  }

  public static async getCourseById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid course ID' });
      return;
    }

    const courseRes = await query(
      `SELECT c.id, c.code, c.name, c.credits, c.department_id, c.semester, c.description, c.is_core,
              d.name as department_name, d.code as department_code
       FROM courses c
       JOIN departments d ON d.id = c.department_id
       WHERE c.id = $1`,
      [id]
    );

    if (courseRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Course not found' });
      return;
    }
    const c = courseRes.rows[0];

    // Prerequisites
    const prereqRes = await query(
      `SELECT p.prerequisite_course_id, pr.code, pr.name, pr.credits
       FROM prerequisites p
       JOIN courses pr ON pr.id = p.prerequisite_course_id
       WHERE p.course_id = $1`,
      [id]
    );

    // Sections
    const secRes = await query(
      `SELECT cs.id, cs.section_code, cs.faculty_name, cs.max_capacity, cs.room_number, cs.semester_term
       FROM course_sections cs
       WHERE cs.course_id = $1`,
      [id]
    );

    const sectionsWithSeats = await Promise.all(
      secRes.rows.map(async (sec) => {
        const seatInfo = await SeatService.getAvailableSeats(sec.id);
        const schedRes = await query<Schedule>(
          'SELECT id, section_id, day_of_week, start_time, end_time, building, room FROM schedules WHERE section_id = $1',
          [sec.id]
        );
        return {
          id: sec.id,
          sectionCode: sec.section_code,
          facultyName: sec.faculty_name,
          maxCapacity: sec.max_capacity,
          roomNumber: sec.room_number,
          semesterTerm: sec.semester_term,
          availableSeats: seatInfo.available,
          seatStatus: seatInfo.status,
          schedules: schedRes.rows
        };
      })
    );

    res.json({
      success: true,
      course: {
        id: c.id,
        code: c.code,
        name: c.name,
        credits: c.credits,
        departmentCode: c.department_code,
        departmentName: c.department_name,
        semester: c.semester,
        description: c.description,
        isCore: c.is_core,
        prerequisites: prereqRes.rows,
        sections: sectionsWithSeats
      }
    });
  }

  public static async getPrerequisites(req: Request, res: Response): Promise<void> {
    const courseId = parseInt(req.params.id as string, 10);
    const prereqRes = await query(
      `SELECT p.prerequisite_course_id, pr.code, pr.name, pr.credits, pr.semester
       FROM prerequisites p
       JOIN courses pr ON pr.id = p.prerequisite_course_id
       WHERE p.course_id = $1`,
      [courseId]
    );

    res.json({
      success: true,
      courseId,
      prerequisites: prereqRes.rows
    });
  }

  public static async getSeats(req: Request, res: Response): Promise<void> {
    const courseId = parseInt(req.params.id as string, 10);

    const secRes = await query<{ id: number; section_code: string }>(
      'SELECT id, section_code FROM course_sections WHERE course_id = $1',
      [courseId]
    );

    const seats = await Promise.all(
      secRes.rows.map(async (sec) => {
        const info = await SeatService.getAvailableSeats(sec.id);
        return {
          sectionId: sec.id,
          sectionCode: sec.section_code,
          ...info
        };
      })
    );

    res.json({
      success: true,
      courseId,
      sections: seats
    });
  }
}
