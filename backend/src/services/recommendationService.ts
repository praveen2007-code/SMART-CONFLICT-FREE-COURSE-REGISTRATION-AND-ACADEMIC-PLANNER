import { Student, User, Department, CompletedCourse, Enrollment, CourseSection, Course } from '../models';

export interface AcademicRecommendation {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  departmentName: string;
  semester: number;
  isCore: boolean;
  eligible: boolean;
  priorityScore: number;
  reason: string;
  prerequisites: {
    prereqCode: string;
    prereqName: string;
    satisfied: boolean;
  }[];
}

export class RecommendationService {
  /**
   * Generates intelligent, personalized course recommendations for a student
   */
  public static async getRecommendations(studentId: number): Promise<{
    recommendations: AcademicRecommendation[];
    studentSummary: {
      studentIdString: string;
      studentName: string;
      semester: number;
      completedCredits: number;
      registeredCredits: number;
      maxCredits: number;
      currentGpa: number;
    };
  }> {
    // 1. Get student profile
    const student = await Student.findOne({ id: studentId });
    if (!student) {
      throw new Error('Student profile not found');
    }

    const user = await User.findOne({ id: student.user_id });
    const studentDept = await Department.findOne({ id: student.department_id });

    // 2. Get completed courses
    const completed = await CompletedCourse.find({ student_id: studentId });
    const completedIds = new Set<number>(completed.map((r: any) => r.course_id));

    const allCourses = await Course.find();
    const courseMap = new Map<number, any>();
    allCourses.forEach((c: any) => courseMap.set(c.id, c));

    const completedCredits = completed.reduce((acc: number, r: any) => {
      const c = courseMap.get(r.course_id);
      return acc + (c?.credits || 0);
    }, 0);

    // 3. Get currently registered courses
    const activeEnrollments = await Enrollment.find({ student_id: studentId, status: 'REGISTERED' });
    const activeSectionIds = activeEnrollments.map((e: any) => e.section_id);
    const activeSections = await CourseSection.find({ id: { $in: activeSectionIds } });

    const registeredIds = new Set<number>(activeSections.map((s: any) => s.course_id));
    const registeredCredits = activeSections.reduce((acc: number, s: any) => {
      const c = courseMap.get(s.course_id);
      return acc + (c?.credits || 0);
    }, 0);

    // 4. Departments Map
    const departments = await Department.find();
    const deptMap = new Map<number, string>();
    departments.forEach((d) => deptMap.set(d.id, d.name));

    // 5. Evaluate and score recommendations
    const recommendations: AcademicRecommendation[] = [];

    for (const course of allCourses) {
      // Exclude courses already completed or currently registered
      if (completedIds.has(course.id) || registeredIds.has(course.id)) {
        continue;
      }

      const reqIds = course.prerequisites || [];
      let allPrereqsSatisfied = true;
      const checkedPrereqs = reqIds.map((pId: number) => {
        const pCourse = courseMap.get(pId);
        const satisfied = completedIds.has(pId);
        if (!satisfied) allPrereqsSatisfied = false;
        return {
          prereqCode: pCourse?.code || `C-${pId}`,
          prereqName: pCourse?.name || 'Prerequisite',
          satisfied
        };
      });

      let priorityScore = 0;
      const reasons: string[] = [];

      // Reason 1: Semester progression match
      if (course.semester === student.semester) {
        priorityScore += 50;
        reasons.push(`Targeted for your current standing (Semester ${student.semester}).`);
      } else if (course.semester < student.semester) {
        priorityScore += 60; // Catching up on missed lower-division core!
        reasons.push(`Essential prior core requirement (Semester ${course.semester}).`);
      } else if (course.semester === student.semester + 1 && allPrereqsSatisfied) {
        priorityScore += 35;
        reasons.push(`Advance your degree pathway ahead of schedule.`);
      }

      // Reason 2: Core vs Elective
      if (course.is_core) {
        priorityScore += 40;
        reasons.push('Mandatory core curriculum requirement.');
      } else {
        priorityScore += 20;
      }

      // Reason 3: Prerequisite status
      if (allPrereqsSatisfied) {
        priorityScore += 50;
        if (reqIds.length > 0) {
          const satisfiedNames = checkedPrereqs.map((cp: any) => cp.prereqCode).join(', ');
          reasons.push(`All prerequisites satisfied: ${satisfiedNames} ✓`);
        } else {
          reasons.push('No prerequisites required — open enrollment.');
        }
      } else {
        priorityScore -= 100;
        const missing = checkedPrereqs.filter((cp: any) => !cp.satisfied).map((cp: any) => cp.prereqCode).join(', ');
        reasons.push(`Prerequisites missing (${missing}) — complete prerequisites first.`);
      }

      // Reason 4: Same department focus
      if (course.department_id === student.department_id) {
        priorityScore += 20;
      }

      recommendations.push({
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        credits: course.credits,
        departmentName: deptMap.get(course.department_id) || 'Computer Science',
        semester: course.semester,
        isCore: course.is_core,
        eligible: allPrereqsSatisfied,
        priorityScore,
        reason: reasons.join(' '),
        prerequisites: checkedPrereqs
      });
    }

    // Sort: Eligible first, then highest priority score
    recommendations.sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return b.priorityScore - a.priorityScore;
    });

    return {
      recommendations,
      studentSummary: {
        studentIdString: student.student_id,
        studentName: user?.name || 'Student',
        semester: student.semester,
        completedCredits,
        registeredCredits,
        maxCredits: student.max_credits,
        currentGpa: student.current_gpa
      }
    };
  }
}
