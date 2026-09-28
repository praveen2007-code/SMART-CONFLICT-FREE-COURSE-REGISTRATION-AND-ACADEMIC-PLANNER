import { Request, Response } from 'express';
import { z } from 'zod';
import {
  Course,
  CourseSection,
  Enrollment,
  Student,
  User,
  Department
} from '../models';
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
    const totalStudents = await Student.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeRegistrations = await Enrollment.countDocuments({ status: 'REGISTERED' });

    const sections = await CourseSection.find();
    const courses = await Course.find();
    const courseMap = new Map<number, any>();
    courses.forEach((c) => courseMap.set(c.id, c));

    const fullCourses: any[] = [];
    const lowEnrollmentCourses: any[] = [];

    const sectionStats = await Promise.all(
      sections.map(async (s) => {
        const enrolled = await Enrollment.countDocuments({ section_id: s.id, status: 'REGISTERED' });
        const capacity = s.max_capacity;
        const available = Math.max(0, capacity - enrolled);
        const percentage = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;
        const c = courseMap.get(s.course_id);

        const item = {
          sectionId: s.id,
          courseId: s.course_id,
          courseCode: c?.code || 'UNKNOWN',
          courseName: c?.name || 'Unknown Course',
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
      })
    );

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        activeRegistrations,
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

    const lastCourse = await Course.findOne().sort({ id: -1 });
    const nextCourseId = (lastCourse?.id || 0) + 1;

    const newCourse = await Course.create({
      id: nextCourseId,
      code: data.code.toUpperCase(),
      name: data.name,
      credits: data.credits,
      department_id: data.departmentId,
      semester: data.semester,
      description: data.description || '',
      is_core: data.isCore,
      prerequisites: data.prerequisiteIds || []
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: newCourse
    });
  }

  /**
   * Update an existing course
   */
  public static async updateCourse(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    const data = courseSchema.partial().parse(req.body);

    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.credits !== undefined) update.credits = data.credits;
    if (data.departmentId !== undefined) update.department_id = data.departmentId;
    if (data.semester !== undefined) update.semester = data.semester;
    if (data.description !== undefined) update.description = data.description;
    if (data.isCore !== undefined) update.is_core = data.isCore;
    if (data.prerequisiteIds !== undefined) update.prerequisites = data.prerequisiteIds;

    const course = await Course.findOneAndUpdate({ id }, update, { new: true });
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  }

  /**
   * Delete a course
   */
  public static async deleteCourse(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);

    const deleted = await Course.findOneAndDelete({ id });
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Course not found' });
      return;
    }

    // Also delete sections
    await CourseSection.deleteMany({ course_id: id });

    res.json({
      success: true,
      message: `Course ${deleted.code} deleted successfully.`
    });
  }

  /**
   * Create course section with schedule slots
   */
  public static async createSection(req: Request, res: Response): Promise<void> {
    const data = sectionSchema.parse(req.body);

    const lastSection = await CourseSection.findOne().sort({ id: -1 });
    const nextSectionId = (lastSection?.id || 0) + 1;

    const schedules = (data.schedules || []).map((s) => ({
      section_id: nextSectionId,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      building: s.building || 'Main Campus',
      room: s.room
    }));

    const newSection = await CourseSection.create({
      id: nextSectionId,
      course_id: data.courseId,
      section_code: data.sectionCode,
      faculty_name: data.facultyName,
      max_capacity: data.maxCapacity,
      enrolled_count: 0,
      room_number: data.roomNumber,
      semester_term: data.semesterTerm,
      schedules
    });

    // Sync Redis seat count
    await SeatService.getAvailableSeats(nextSectionId);

    res.status(201).json({
      success: true,
      message: 'Course section created successfully',
      section: newSection
    });
  }

  /**
   * Update section capacity or faculty
   */
  public static async updateSection(req: Request, res: Response): Promise<void> {
    const sectionId = parseInt(req.params.id as string, 10);
    const { maxCapacity, facultyName, roomNumber } = req.body;

    const update: any = {};
    if (maxCapacity !== undefined) update.max_capacity = maxCapacity;
    if (facultyName !== undefined) update.faculty_name = facultyName;
    if (roomNumber !== undefined) update.room_number = roomNumber;

    const section = await CourseSection.findOneAndUpdate({ id: sectionId }, update, { new: true });
    if (!section) {
      res.status(404).json({ success: false, error: 'Section not found' });
      return;
    }

    // Refresh seat counts
    await SeatService.getAvailableSeats(sectionId);

    res.json({
      success: true,
      message: 'Section updated successfully',
      section
    });
  }

  /**
   * View all active student registrations across university
   */
  public static async getRegistrations(req: Request, res: Response): Promise<void> {
    const enrollments = await Enrollment.find().sort({ enrolled_at: -1 }).limit(100);

    const studentIds = enrollments.map((e) => e.student_id);
    const students = await Student.find({ id: { $in: studentIds } });
    const studentMap = new Map<number, any>();
    students.forEach((s) => studentMap.set(s.id, s));

    const userIds = students.map((s) => s.user_id);
    const users = await User.find({ id: { $in: userIds } });
    const userMap = new Map<number, any>();
    users.forEach((u) => userMap.set(u.id, u));

    const sectionIds = enrollments.map((e) => e.section_id);
    const sections = await CourseSection.find({ id: { $in: sectionIds } });
    const sectionMap = new Map<number, any>();
    sections.forEach((s) => sectionMap.set(s.id, s));

    const courseIds = sections.map((s) => s.course_id);
    const courses = await Course.find({ id: { $in: courseIds } });
    const courseMap = new Map<number, any>();
    courses.forEach((c) => courseMap.set(c.id, c));

    const registrations = enrollments.map((e) => {
      const student = studentMap.get(e.student_id);
      const user = student ? userMap.get(student.user_id) : null;
      const sec = sectionMap.get(e.section_id);
      const course = sec ? courseMap.get(sec.course_id) : null;

      return {
        id: e.id,
        status: e.status,
        enrolled_at: e.enrolled_at,
        student_code: student?.student_id || 'STU',
        student_name: user?.name || 'Student',
        student_email: user?.email || '',
        course_code: course?.code || 'UNKNOWN',
        course_name: course?.name || 'Unknown Course',
        credits: course?.credits || 3,
        section_code: sec?.section_code || 'SEC',
        faculty_name: sec?.faculty_name || ''
      };
    });

    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  }
}
