import { Request, Response } from 'express';
import { z } from 'zod';
import { query, pool } from '../config/db';
import { SeatService } from '../services/seatService';

const courseSchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(150),
  credits: z.number().int().min(1).max(6),
  departmentId: z.number().int().positive(),
  semester: z.number().int().min(1).max(8),
  description: z.string().optional(),
  isCore: z.boolean().default(true),
  prerequisiteIds: z.array(z.number().int().positive()).optional()
});

const sectionSchema = z.object({
  courseId: z.number().int().positive(),
  sectionCode: z.string().min(1).max(10),
  facultyName: z.string().min(2).max(100),
  maxCapacity: z.number().int().positive().default(30),
  roomNumber: z.string().min(1).max(50),
  semesterTerm: z.string().default('Fall 2026'),
  schedules: z
    .array(
      z.object({
        dayOfWeek: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']),
        startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/),
        endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/),
        building: z.string().optional(),
        room: z.string()
      })
    )
    .optional()
});

export class AdminController {
  /**
   * Get Admin Overview Analytics & Enrollment Statistics
   */
  public static async getStats(req: Request, res: Response): Promise<void> {
    // 1. Total counts
    const totalStudentsRes = await query('SELECT COUNT(*) as count FROM students');
    const totalCoursesRes = await query('SELECT COUNT(*) as count FROM courses');
    const activeRegistrationsRes = await query("SELECT COUNT(*) as count FROM enrollments WHERE status = 'REGISTERED'");

    // 2. Course Sections with enrollment levels
    const sectionsRes = await query(
      `SELECT cs.id, cs.section_code, cs.faculty_name, cs.max_capacity,
              c.id as course_id, c.code as course_code, c.name as course_name,
              COUNT(e.id) FILTER (WHERE e.status = 'REGISTERED') as enrolled_count
       FROM course_sections cs
       JOIN courses c ON c.id = cs.course_id
       LEFT JOIN enrollments e ON e.section_id = cs.id
       GROUP BY cs.id, c.id, c.code, c.name
       ORDER BY enrolled_count DESC`
    );

    const fullCourses: any[] = [];
    const lowEnrollmentCourses: any[] = [];

    const sectionStats = sectionsRes.rows.map((s) => {
      const enrolled = parseInt(s.enrolled_count || '0', 10);
      const capacity = s.max_capacity;
      const available = Math.max(0, capacity - enrolled);
      const percentage = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

      const item = {
        sectionId: s.id,
        courseId: s.course_id,
        courseCode: s.course_code,
        courseName: s.course_name,
        sectionCode: s.section_code,
        facultyName: s.faculty_name,
        enrolled,
        capacity,
        available,
        percentage,
        status: SeatService.calculateStatus(available, capacity)
      };

      if (available === 0) {
        fullCourses.push(item);
      } else if (enrolled <= 3) {
        lowEnrollmentCourses.push(item);
      }

      return item;
    });

    res.json({
      success: true,
      stats: {
        totalStudents: parseInt(totalStudentsRes.rows[0]?.count || '0', 10),
        totalCourses: parseInt(totalCoursesRes.rows[0]?.count || '0', 10),
        activeRegistrations: parseInt(activeRegistrationsRes.rows[0]?.count || '0', 10),
        fullCoursesCount: fullCourses.length,
        lowEnrollmentCount: lowEnrollmentCourses.length
      },
      fullCourses,
      lowEnrollmentCourses,
      sections: sectionStats
    });
  }

  /**
   * Add a new course
   */
  public static async createCourse(req: Request, res: Response): Promise<void> {
    const data = courseSchema.parse(req.body);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const courseRes = await client.query(
        `INSERT INTO courses (code, name, credits, department_id, semester, description, is_core)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, code, name, credits, department_id, semester, description, is_core`,
        [data.code.toUpperCase(), data.name, data.credits, data.departmentId, data.semester, data.description || '', data.isCore]
      );
      const newCourse = courseRes.rows[0];

      if (data.prerequisiteIds && data.prerequisiteIds.length > 0) {
        for (const prereqId of data.prerequisiteIds) {
          await client.query(
            `INSERT INTO prerequisites (course_id, prerequisite_course_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [newCourse.id, prereqId]
          );
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course: newCourse
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update an existing course
   */
  public static async updateCourse(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    const data = courseSchema.partial().parse(req.body);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const courseRes = await client.query(
        `UPDATE courses
         SET name = COALESCE($1, name),
             credits = COALESCE($2, credits),
             department_id = COALESCE($3, department_id),
             semester = COALESCE($4, semester),
             description = COALESCE($5, description),
             is_core = COALESCE($6, is_core)
         WHERE id = $7
         RETURNING *`,
        [data.name, data.credits, data.departmentId, data.semester, data.description, data.isCore, id]
      );

      if (courseRes.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ success: false, error: 'Course not found' });
        return;
      }

      if (data.prerequisiteIds) {
        await client.query('DELETE FROM prerequisites WHERE course_id = $1', [id]);
        for (const prereqId of data.prerequisiteIds) {
          await client.query(
            `INSERT INTO prerequisites (course_id, prerequisite_course_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, prereqId]
          );
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Course updated successfully',
        course: courseRes.rows[0]
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a course
   */
  public static async deleteCourse(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);

    const deleteRes = await query('DELETE FROM courses WHERE id = $1 RETURNING id, code', [id]);
    if (deleteRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Course not found' });
      return;
    }

    res.json({
      success: true,
      message: `Course ${deleteRes.rows[0].code} deleted successfully.`
    });
  }

  /**
   * Create course section with schedule slots
   */
  public static async createSection(req: Request, res: Response): Promise<void> {
    const data = sectionSchema.parse(req.body);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const secRes = await client.query(
        `INSERT INTO course_sections (course_id, section_code, faculty_name, max_capacity, room_number, semester_term)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [data.courseId, data.sectionCode, data.facultyName, data.maxCapacity, data.roomNumber, data.semesterTerm]
      );
      const section = secRes.rows[0];

      if (data.schedules && data.schedules.length > 0) {
        for (const s of data.schedules) {
          await client.query(
            `INSERT INTO schedules (section_id, day_of_week, start_time, end_time, building, room)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [section.id, s.dayOfWeek, s.startTime, s.endTime, s.building || 'Main Campus', s.room]
          );
        }
      }

      await client.query('COMMIT');

      // Sync Redis seat count
      await SeatService.getAvailableSeats(section.id);

      res.status(201).json({
        success: true,
        message: 'Course section created successfully',
        section
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update section capacity or faculty
   */
  public static async updateSection(req: Request, res: Response): Promise<void> {
    const sectionId = parseInt(req.params.id as string, 10);
    const { maxCapacity, facultyName, roomNumber } = req.body;

    const secRes = await query(
      `UPDATE course_sections
       SET max_capacity = COALESCE($1, max_capacity),
           faculty_name = COALESCE($2, faculty_name),
           room_number = COALESCE($3, room_number)
       WHERE id = $4
       RETURNING *`,
      [maxCapacity, facultyName, roomNumber, sectionId]
    );

    if (secRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Section not found' });
      return;
    }

    // Refresh seat counts
    await SeatService.getAvailableSeats(sectionId);

    res.json({
      success: true,
      message: 'Section updated successfully',
      section: secRes.rows[0]
    });
  }

  /**
   * View all active student registrations across university
   */
  public static async getRegistrations(req: Request, res: Response): Promise<void> {
    const regRes = await query(
      `SELECT e.id, e.status, e.enrolled_at,
              s.student_id as student_code, u.name as student_name, u.email as student_email,
              c.code as course_code, c.name as course_name, c.credits,
              cs.section_code, cs.faculty_name
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       JOIN course_sections cs ON cs.id = e.section_id
       JOIN courses c ON c.id = cs.course_id
       ORDER BY e.enrolled_at DESC
       LIMIT 100`
    );

    res.json({
      success: true,
      count: regRes.rows.length,
      registrations: regRes.rows
    });
  }
}
