import { Request, Response } from 'express';
import { z } from 'zod';
import {
  Course,
  CourseSection,
  Enrollment,
  Student,
  User,
  Department,
  CompletedCourse,
  RegistrationLog
} from '../models';
import { SeatService } from '../services/seatService';
import { ALL_COURSES, COURSE_PREREQUISITES } from '../data/allCoursesList';
import { EXTRA_COURSES, EXTRA_COURSE_PREREQUISITES } from '../data/extraCoursesList';

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

    const students = await Student.find();
    const allEnrollments = await Enrollment.find({ status: 'REGISTERED' });

    const sectionToCourseMap = new Map<number, any>();
    sections.forEach((s) => {
      const c = courseMap.get(s.course_id);
      if (c) sectionToCourseMap.set(s.id, c);
    });

    const semesterRegistrations = [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
      const semCourses = courses.filter((c) => c.semester === sem);
      const semCourseIds = new Set(semCourses.map((c) => c.id));
      const semSections = sections.filter((s) => semCourseIds.has(s.course_id));
      const semSectionIds = new Set(semSections.map((s) => s.id));

      const semEnrollments = allEnrollments.filter((e) => semSectionIds.has(e.section_id));
      const uniqueStudents = new Set(semEnrollments.map((e) => e.student_id)).size;
      const cohortStudents = students.filter((st) => st.semester === sem).length;

      const deptBreakdown = {
        CS: semEnrollments.filter((e) => sectionToCourseMap.get(e.section_id)?.department_id === 1).length,
        DS: semEnrollments.filter((e) => sectionToCourseMap.get(e.section_id)?.department_id === 2).length,
        EE: semEnrollments.filter((e) => sectionToCourseMap.get(e.section_id)?.department_id === 3).length,
        MATH: semEnrollments.filter((e) => sectionToCourseMap.get(e.section_id)?.department_id === 4).length
      };

      return {
        semester: sem,
        semesterLabel: `Semester ${sem}`,
        shortLabel: `Sem ${sem}`,
        registeredStudents: uniqueStudents,
        totalEnrollments: semEnrollments.length,
        totalCourses: semCourses.length,
        totalSections: semSections.length,
        cohortStudents,
        deptBreakdown
      };
    });

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        activeRegistrations,
        fullCoursesCount: fullCourses.length,
        lowEnrollmentCount: lowEnrollmentCourses.length,
        semesterRegistrations
      },
      semesterRegistrations,
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
   * Clear all courses, sections, and enrollments (for manual custom curriculum setup)
   */
  public static async clearAllCourses(req: Request, res: Response): Promise<void> {
    const c = await Course.deleteMany({});
    const s = await CourseSection.deleteMany({});
    const e = await Enrollment.deleteMany({});
    const comp = await CompletedCourse.deleteMany({});
    const l = await RegistrationLog.deleteMany({});
    await SeatService.syncAllSeats();

    res.json({
      success: true,
      message: 'All courses, sections, and student enrollments cleared successfully.',
      deleted: {
        courses: c.deletedCount,
        sections: s.deletedCount,
        enrollments: e.deletedCount,
        completed: comp.deletedCount,
        logs: l.deletedCount
      }
    });
  }

  /**
   * Populate all 160 courses across 4 departments and 8 semesters, complete with sections
   */
  public static async populateAllCourses(req: Request, res: Response): Promise<void> {
    // 1. Wipe existing courses and sections to prevent duplicate IDs or codes
    await Course.deleteMany({});
    await CourseSection.deleteMany({});
    await Enrollment.deleteMany({});
    await CompletedCourse.deleteMany({});
    await RegistrationLog.deleteMany({});

    const facultyList = [
      'Dr. Alan Turing', 'Dr. Grace Hopper', 'Dr. Claude Shannon', 'Dr. John von Neumann',
      'Dr. Ada Lovelace', 'Dr. Donald Knuth', 'Dr. Barbara Liskov', 'Dr. Edsger Dijkstra',
      'Dr. Tim Berners-Lee', 'Dr. Geoffrey Hinton', 'Dr. Yann LeCun', 'Dr. Yoshua Bengio',
      'Dr. Fei-Fei Li', 'Dr. Andrew Ng', 'Dr. Demis Hassabis', 'Dr. Daphne Koller',
      'Dr. Nikola Tesla', 'Dr. James Clerk Maxwell', 'Dr. Heinrich Hertz', 'Dr. Michael Faraday',
      'Dr. Thomas Edison', 'Dr. Charles Steinmetz', 'Dr. Oliver Heaviside', 'Dr. Guglielmo Marconi',
      'Dr. Carl Friedrich Gauss', 'Dr. Leonhard Euler', 'Dr. Bernhard Riemann', 'Dr. Emmy Noether',
      'Dr. David Hilbert', 'Dr. Henri Poincaré', 'Dr. Srinivasa Ramanujan', 'Dr. Kurt Gödel'
    ];

    // 8 Course weekly schedule patterns filling 100% of the 5x5 weekly timetable (24 class slots + 1 Library Period)
    // Every single period of the day (Hours 1, 2, 3, 4, 5) and every weekday (Mon-Fri) is actively utilized!
    const COURSE_PATTERNS_A: Array<
      Array<{ day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'; start: string; end: string }>
    > = [
      // Course 0: Mon H1 (09:00-10:00), Wed H1 (09:00-10:00), Thu H5 (14:00-15:00)
      [
        { day: 'MON', start: '09:00', end: '10:00' },
        { day: 'WED', start: '09:00', end: '10:00' },
        { day: 'THU', start: '14:00', end: '15:00' }
      ],
      // Course 1: Mon H2 (10:00-11:00), Wed H3 (11:10-12:10), Fri H2 (10:00-11:00)
      [
        { day: 'MON', start: '10:00', end: '11:00' },
        { day: 'WED', start: '11:10', end: '12:10' },
        { day: 'FRI', start: '10:00', end: '11:00' }
      ],
      // Course 2: Mon H3 (11:10-12:10), Tue H2 (10:00-11:00), Thu H2 (10:00-11:00)
      [
        { day: 'MON', start: '11:10', end: '12:10' },
        { day: 'TUE', start: '10:00', end: '11:00' },
        { day: 'THU', start: '10:00', end: '11:00' }
      ],
      // Course 3: Mon H4 (13:00-14:00), Tue H3 (11:10-12:10), Thu H3 (11:10-12:10)
      [
        { day: 'MON', start: '13:00', end: '14:00' },
        { day: 'TUE', start: '11:10', end: '12:10' },
        { day: 'THU', start: '11:10', end: '12:10' }
      ],
      // Course 4: Mon H5 (14:00-15:00), Tue H1 (09:00-10:00), Thu H1 (09:00-10:00)
      [
        { day: 'MON', start: '14:00', end: '15:00' },
        { day: 'TUE', start: '09:00', end: '10:00' },
        { day: 'THU', start: '09:00', end: '10:00' }
      ],
      // Course 5: Tue H4 (13:00-14:00), Wed H5 (14:00-15:00), Fri H3 (11:10-12:10)
      [
        { day: 'TUE', start: '13:00', end: '14:00' },
        { day: 'WED', start: '14:00', end: '15:00' },
        { day: 'FRI', start: '11:10', end: '12:10' }
      ],
      // Course 6: Tue H5 (14:00-15:00), Wed H2 (10:00-11:00), Fri H1 (09:00-10:00)
      [
        { day: 'TUE', start: '14:00', end: '15:00' },
        { day: 'WED', start: '10:00', end: '11:00' },
        { day: 'FRI', start: '09:00', end: '10:00' }
      ],
      // Course 7: Thu H4 (13:00-14:00), Fri H4 (13:00-14:00), Fri H5 (14:00-15:00)
      [
        { day: 'THU', start: '13:00', end: '14:00' },
        { day: 'FRI', start: '13:00', end: '14:00' },
        { day: 'FRI', start: '14:00', end: '15:00' }
      ]
    ];

    // Section B (Complimentary rotated patterns so SEC-B is also 100% full with zero conflicts)
    const COURSE_PATTERNS_B: Array<
      Array<{ day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'; start: string; end: string }>
    > = [
      // Course 0 SEC-B: Tue H1, Thu H1, Mon H5
      [
        { day: 'TUE', start: '09:00', end: '10:00' },
        { day: 'THU', start: '09:00', end: '10:00' },
        { day: 'MON', start: '14:00', end: '15:00' }
      ],
      // Course 1 SEC-B: Tue H2, Thu H3, Mon H2
      [
        { day: 'TUE', start: '10:00', end: '11:00' },
        { day: 'THU', start: '11:10', end: '12:10' },
        { day: 'MON', start: '10:00', end: '11:00' }
      ],
      // Course 2 SEC-B: Tue H3, Wed H2, Fri H2
      [
        { day: 'TUE', start: '11:10', end: '12:10' },
        { day: 'WED', start: '10:00', end: '11:00' },
        { day: 'FRI', start: '10:00', end: '11:00' }
      ],
      // Course 3 SEC-B: Tue H4, Wed H3, Fri H3
      [
        { day: 'TUE', start: '13:00', end: '14:00' },
        { day: 'WED', start: '11:10', end: '12:10' },
        { day: 'FRI', start: '11:10', end: '12:10' }
      ],
      // Course 4 SEC-B: Wed H1, Fri H1, Mon H1
      [
        { day: 'WED', start: '09:00', end: '10:00' },
        { day: 'FRI', start: '09:00', end: '10:00' },
        { day: 'MON', start: '09:00', end: '10:00' }
      ],
      // Course 5 SEC-B: Wed H5, Thu H5, Mon H3
      [
        { day: 'WED', start: '14:00', end: '15:00' },
        { day: 'THU', start: '14:00', end: '15:00' },
        { day: 'MON', start: '11:10', end: '12:10' }
      ],
      // Course 6 SEC-B: Thu H2, Fri H4, Mon H4
      [
        { day: 'THU', start: '10:00', end: '11:00' },
        { day: 'FRI', start: '13:00', end: '14:00' },
        { day: 'MON', start: '13:00', end: '14:00' }
      ],
      // Course 7 SEC-B: Thu H4, Fri H5, Tue H5
      [
        { day: 'THU', start: '13:00', end: '14:00' },
        { day: 'FRI', start: '14:00', end: '15:00' },
        { day: 'TUE', start: '14:00', end: '15:00' }
      ]
    ];

    const fullCatalog = [...ALL_COURSES, ...EXTRA_COURSES];
    const combinedPrereqs: Record<string, string[]> = {
      ...COURSE_PREREQUISITES,
      ...EXTRA_COURSE_PREREQUISITES
    };

    const codeToIdMap = new Map<string, number>();
    fullCatalog.forEach((raw, idx) => codeToIdMap.set(raw.code, idx + 1));

    const courseDocs = [];
    const sectionDocs = [];
    const groupCounts = new Map<string, number>();

    for (let i = 0; i < fullCatalog.length; i++) {
      const raw = fullCatalog[i];
      const courseId = i + 1;

      const prereqCodes = combinedPrereqs[raw.code] || [];
      const prereqIds = prereqCodes
        .map((code) => codeToIdMap.get(code))
        .filter((id): id is number => id !== undefined);

      courseDocs.push({
        id: courseId,
        code: raw.code,
        name: raw.name,
        department_id: raw.department_id,
        credits: raw.credits,
        semester: raw.semester,
        description: raw.description,
        is_core: true,
        prerequisites: prereqIds
      });

      // Distribute each course in (department, semester) to a unique, non-overlapping slot
      const groupKey = `${raw.department_id}_${raw.semester}`;
      const slotIndex = (groupCounts.get(groupKey) || 0) % 8;
      groupCounts.set(groupKey, slotIndex + 1);

      const patA = COURSE_PATTERNS_A[slotIndex];
      const patB = COURSE_PATTERNS_B[slotIndex];

      const facultyA = facultyList[i % facultyList.length];
      const facultyB = facultyList[(i + 7) % facultyList.length];
      const hallNumberA = `Hall-${101 + (i % 30)}`;
      const hallNumberB = `Hall-${201 + (i % 30)}`;

      // Section A
      sectionDocs.push({
        id: courseId,
        course_id: courseId,
        section_code: 'SEC-A',
        faculty_name: facultyA,
        max_capacity: 40,
        enrolled_count: 0,
        room_number: hallNumberA,
        semester_term: 'Fall 2026',
        schedules: patA.map((p) => ({
          section_id: courseId,
          day_of_week: p.day,
          start_time: p.start,
          end_time: p.end,
          building: 'Science & Engineering Tower',
          room: hallNumberA
        }))
      });

      // Section B (Alternative slot for flexible student selection)
      const secBId = 1000 + courseId;
      sectionDocs.push({
        id: secBId,
        course_id: courseId,
        section_code: 'SEC-B',
        faculty_name: facultyB,
        max_capacity: 40,
        enrolled_count: 0,
        room_number: hallNumberB,
        semester_term: 'Fall 2026',
        schedules: patB.map((p) => ({
          section_id: secBId,
          day_of_week: p.day,
          start_time: p.start,
          end_time: p.end,
          building: 'North Academic Center',
          room: hallNumberB
        }))
      });
    }

    await Course.insertMany(courseDocs);
    await CourseSection.insertMany(sectionDocs);

    await SeatService.syncAllSeats();

    res.json({
      success: true,
      message: `Successfully populated ${courseDocs.length} courses (8 per semester across all 4 departments) and ${sectionDocs.length} conflict-free sections.`,
      coursesAdded: courseDocs.length,
      sectionsAdded: sectionDocs.length
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

  /**
   * Get Course-to-Department Registration Analytics
   * Counts how many students from each department registered for each course
   */
  public static async getDepartmentAnalytics(req: Request, res: Response): Promise<void> {
    const departments = await Department.find();
    const deptMap = new Map<number, { code: string; name: string }>();
    departments.forEach((d) => deptMap.set(d.id, { code: d.code, name: d.name }));

    const courses = await Course.find().sort({ semester: 1, code: 1 });
    const sections = await CourseSection.find();
    const enrollments = await Enrollment.find({ status: 'REGISTERED' });
    const students = await Student.find();
    const users = await User.find();

    const userMap = new Map<number, any>();
    users.forEach((u) => userMap.set(u.id, u));

    const studentMap = new Map<number, any>();
    students.forEach((s) => {
      const u = userMap.get(s.user_id);
      const d = deptMap.get(s.department_id);
      studentMap.set(s.id, {
        id: s.id,
        studentId: s.student_id,
        name: u?.name || 'Unknown Student',
        email: u?.email || '',
        departmentId: s.department_id,
        departmentCode: d?.code || 'UNKNOWN',
        departmentName: d?.name || 'Unknown Dept',
        semester: s.semester
      });
    });

    const courseSectionsMap = new Map<number, number[]>();
    sections.forEach((s) => {
      if (!courseSectionsMap.has(s.course_id)) {
        courseSectionsMap.set(s.course_id, []);
      }
      courseSectionsMap.get(s.course_id)!.push(s.id);
    });

    const sectionEnrollmentsMap = new Map<number, any[]>();
    enrollments.forEach((e) => {
      if (!sectionEnrollmentsMap.has(e.section_id)) {
        sectionEnrollmentsMap.set(e.section_id, []);
      }
      sectionEnrollmentsMap.get(e.section_id)!.push(e);
    });

    let totalCrossDeptEnrollments = 0;

    const courseAnalytics = courses.map((course) => {
      const courseDept = deptMap.get(course.department_id) || { code: 'GEN', name: 'General' };
      const secIds = courseSectionsMap.get(course.id) || [];

      const courseEnrs: any[] = [];
      secIds.forEach((sId) => {
        const enrs = sectionEnrollmentsMap.get(sId) || [];
        courseEnrs.push(...enrs);
      });

      const deptCounts: Record<string, number> = { CS: 0, DS: 0, EE: 0, MATH: 0 };
      const studentList: any[] = [];
      let crossDeptCount = 0;

      courseEnrs.forEach((e) => {
        const stu = studentMap.get(e.student_id);
        if (stu) {
          const code = stu.departmentCode;
          if (deptCounts[code] !== undefined) {
            deptCounts[code]++;
          } else {
            deptCounts[code] = (deptCounts[code] || 0) + 1;
          }

          if (stu.departmentId !== course.department_id) {
            crossDeptCount++;
            totalCrossDeptEnrollments++;
          }

          studentList.push({
            id: stu.id,
            studentCode: stu.studentId,
            studentName: stu.name,
            studentEmail: stu.email,
            studentDepartment: stu.departmentCode,
            studentSemester: stu.semester,
            enrolledAt: e.enrolled_at
          });
        }
      });

      const totalCount = courseEnrs.length;

      return {
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        departmentId: course.department_id,
        departmentCode: courseDept.code,
        departmentName: courseDept.name,
        semester: course.semester,
        credits: course.credits,
        totalRegistered: totalCount,
        crossDepartmentCount: crossDeptCount,
        isInterdisciplinary: crossDeptCount > 0,
        departmentCounts: deptCounts,
        departmentPercentages: {
          CS: totalCount > 0 ? Math.round((deptCounts.CS / totalCount) * 100) : 0,
          DS: totalCount > 0 ? Math.round((deptCounts.DS / totalCount) * 100) : 0,
          EE: totalCount > 0 ? Math.round((deptCounts.EE / totalCount) * 100) : 0,
          MATH: totalCount > 0 ? Math.round((deptCounts.MATH / totalCount) * 100) : 0
        },
        students: studentList
      };
    });

    const departmentAffinity: Record<string, Record<string, number>> = {
      CS: { CS: 0, DS: 0, EE: 0, MATH: 0 },
      DS: { CS: 0, DS: 0, EE: 0, MATH: 0 },
      EE: { CS: 0, DS: 0, EE: 0, MATH: 0 },
      MATH: { CS: 0, DS: 0, EE: 0, MATH: 0 }
    };

    enrollments.forEach((e) => {
      const stu = studentMap.get(e.student_id);
      const sec = sections.find((s) => s.id === e.section_id);
      const crs = courses.find((c) => c.id === sec?.course_id);
      if (stu && crs) {
        const stuDept = stu.departmentCode;
        const crsDept = deptMap.get(crs.department_id)?.code;
        if (stuDept && crsDept && departmentAffinity[stuDept] && departmentAffinity[stuDept][crsDept] !== undefined) {
          departmentAffinity[stuDept][crsDept]++;
        }
      }
    });

    res.json({
      success: true,
      summary: {
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        totalCrossDeptEnrollments,
        activeCoursesWithRegistrations: courseAnalytics.filter((c) => c.totalRegistered > 0).length,
        departments: departments.map((d) => ({ id: d.id, code: d.code, name: d.name }))
      },
      departmentAffinity,
      courses: courseAnalytics
    });
  }

  /**
   * Clear all student data — keeps departments, courses, sections, and admin intact.
   * Resets seat counters in Redis so sections are back to full capacity.
   */
  public static async clearStudentData(req: Request, res: Response): Promise<void> {
    try {
      // 1. Remove all enrollments & registration logs & completed courses
      const [enrollmentResult, logResult, completedResult] = await Promise.all([
        Enrollment.deleteMany({}),
        RegistrationLog.deleteMany({}),
        CompletedCourse.deleteMany({})
      ]);

      // 2. Remove all student profiles
      const studentResult = await Student.deleteMany({});

      // 3. Remove all users with role STUDENT (keep ADMIN)
      const userResult = await User.deleteMany({ role: 'STUDENT' });

      // 4. Reset enrolled count on every section back to 0
      await CourseSection.updateMany({}, { $set: { enrolled_count: 0 } });

      // 5. Reset Redis seat counters for all sections
      try {
        await SeatService.syncAllSeats();
      } catch {
        // Redis may not be running — skip gracefully
      }

      res.json({
        success: true,
        message: 'All student data cleared. Courses, sections, and admin account preserved.',
        deleted: {
          students: studentResult.deletedCount,
          studentUsers: userResult.deletedCount,
          enrollments: enrollmentResult.deletedCount,
          registrationLogs: logResult.deletedCount,
          completedCourses: completedResult.deletedCount
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
