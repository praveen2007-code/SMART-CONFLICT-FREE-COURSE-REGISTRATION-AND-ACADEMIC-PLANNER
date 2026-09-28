import { Request, Response } from 'express';
import { Course, CourseSection, Department, CompletedCourse, Enrollment } from '../models';
import { SeatService } from '../services/seatService';

export class CourseController {
  public static async getCourses(req: Request, res: Response): Promise<void> {
    const { search, department, semester, studentId } = req.query;

    const filter: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { code: searchRegex },
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    if (semester && semester !== 'ALL') {
      filter.semester = parseInt(semester as string, 10);
    }

    // Departments lookup map
    const departments = await Department.find();
    const deptMap = new Map<number, { code: string; name: string }>();
    departments.forEach((d) => deptMap.set(d.id, { code: d.code, name: d.name }));

    if (department && department !== 'ALL') {
      const matchedDept = departments.find((d) => d.code === department);
      if (matchedDept) {
        filter.department_id = matchedDept.id;
      } else {
        res.json({ success: true, count: 0, courses: [] });
        return;
      }
    }

    const courses = await Course.find(filter).sort({ semester: 1, code: 1 });
    const allCourses = await Course.find();
    const courseCodeMap = new Map<number, { code: string; name: string; credits: number; semester: number }>();
    allCourses.forEach((c) => courseCodeMap.set(c.id, { code: c.code, name: c.name, credits: c.credits, semester: c.semester }));

    // Fetch student completion info
    let completedCourseIds = new Set<number>();
    let registeredCourseIds = new Set<number>();

    const targetStudentId = studentId ? parseInt(studentId as string, 10) : req.user?.studentId;

    if (targetStudentId) {
      const completed = await CompletedCourse.find({ student_id: targetStudentId });
      completedCourseIds = new Set(completed.map((c) => c.course_id));

      const activeEnrollments = await Enrollment.find({ student_id: targetStudentId, status: 'REGISTERED' });
      const activeSectionIds = activeEnrollments.map((e) => e.section_id);
      const activeSections = await CourseSection.find({ id: { $in: activeSectionIds } });
      registeredCourseIds = new Set(activeSections.map((s) => s.course_id));
    }

    // Fetch all sections
    const allSections = await CourseSection.find().sort({ section_code: 1 });

    const enrichedCourses = await Promise.all(
      courses.map(async (c) => {
        const dept = deptMap.get(c.department_id) || { code: 'CS', name: 'Computer Science' };

        // Prerequisites formatted
        const prereqList = (c.prerequisites || []).map((pId) => {
          const pInfo = courseCodeMap.get(pId);
          return {
            prerequisiteCourseId: pId,
            code: pInfo?.code || `COURSE-${pId}`,
            name: pInfo?.name || '',
            credits: pInfo?.credits || 3,
            satisfied: completedCourseIds.has(pId)
          };
        });

        const satisfiesPrerequisites = prereqList.every((p) => p.satisfied);

        const cSections = allSections.filter((s) => s.course_id === c.id);

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
              schedules: sec.schedules || []
            };
          })
        );

        const totalSeats = enrichedSections.reduce((acc, s) => acc + s.availableSeats, 0);

        return {
          id: c.id,
          code: c.code,
          name: c.name,
          credits: c.credits,
          departmentId: c.department_id,
          departmentCode: dept.code,
          departmentName: dept.name,
          semester: c.semester,
          description: c.description,
          isCore: c.is_core,
          isCompleted: completedCourseIds.has(c.id),
          isRegistered: registeredCourseIds.has(c.id),
          satisfiesPrerequisites,
          prerequisites: prereqList,
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

    const c = await Course.findOne({ id });
    if (!c) {
      res.status(404).json({ success: false, error: 'Course not found' });
      return;
    }

    const dept = await Department.findOne({ id: c.department_id });

    // Prerequisites
    const allCourses = await Course.find();
    const courseCodeMap = new Map<number, any>();
    allCourses.forEach((item) => courseCodeMap.set(item.id, item));

    const prereqList = (c.prerequisites || []).map((pId) => {
      const pInfo = courseCodeMap.get(pId);
      return {
        prerequisiteCourseId: pId,
        code: pInfo?.code || '',
        name: pInfo?.name || '',
        credits: pInfo?.credits || 3
      };
    });

    // Sections
    const sections = await CourseSection.find({ course_id: id });
    const sectionsWithSeats = await Promise.all(
      sections.map(async (sec) => {
        const seatInfo = await SeatService.getAvailableSeats(sec.id);
        return {
          id: sec.id,
          sectionCode: sec.section_code,
          facultyName: sec.faculty_name,
          maxCapacity: sec.max_capacity,
          roomNumber: sec.room_number,
          semesterTerm: sec.semester_term,
          availableSeats: seatInfo.available,
          seatStatus: seatInfo.status,
          schedules: sec.schedules || []
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
        departmentCode: dept?.code || 'CS',
        departmentName: dept?.name || 'Computer Science',
        semester: c.semester,
        description: c.description,
        isCore: c.is_core,
        prerequisites: prereqList,
        sections: sectionsWithSeats
      }
    });
  }

  public static async getPrerequisites(req: Request, res: Response): Promise<void> {
    const courseId = parseInt(req.params.id as string, 10);
    const course = await Course.findOne({ id: courseId });

    if (!course) {
      res.json({ success: true, courseId, prerequisites: [] });
      return;
    }

    const prereqCourses = await Course.find({ id: { $in: course.prerequisites || [] } });
    const formatted = prereqCourses.map((pr) => ({
      prerequisite_course_id: pr.id,
      code: pr.code,
      name: pr.name,
      credits: pr.credits,
      semester: pr.semester
    }));

    res.json({
      success: true,
      courseId,
      prerequisites: formatted
    });
  }

  public static async getSeats(req: Request, res: Response): Promise<void> {
    const courseId = parseInt(req.params.id as string, 10);
    const sections = await CourseSection.find({ course_id: courseId });

    const seats = await Promise.all(
      sections.map(async (sec) => {
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
