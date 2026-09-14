import { query } from '../config/db';

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
    const studentRes = await query(
      `SELECT s.id, s.student_id as code, s.semester, s.max_credits, s.current_gpa,
              u.name as student_name, s.department_id, d.name as department_name
       FROM students s
       JOIN users u ON u.id = s.user_id
       JOIN departments d ON d.id = s.department_id
       WHERE s.id = $1`,
      [studentId]
    );

    if (studentRes.rows.length === 0) {
      throw new Error('Student profile not found');
    }
    const student = studentRes.rows[0];

    // 2. Get completed courses
    const completedRes = await query<{ course_id: number; credits: number }>(
      `SELECT cc.course_id, c.credits
       FROM completed_courses cc
       JOIN courses c ON c.id = cc.course_id
       WHERE cc.student_id = $1`,
      [studentId]
    );
    const completedIds = new Set<number>(completedRes.rows.map((r) => r.course_id));
    const completedCredits = completedRes.rows.reduce((acc, r) => acc + r.credits, 0);

    // 3. Get currently registered courses
    const registeredRes = await query<{ course_id: number; credits: number }>(
      `SELECT cs.course_id, c.credits
       FROM enrollments e
       JOIN course_sections cs ON cs.id = e.section_id
       JOIN courses c ON c.id = cs.course_id
       WHERE e.student_id = $1 AND e.status = 'REGISTERED'`,
      [studentId]
    );
    const registeredIds = new Set<number>(registeredRes.rows.map((r) => r.course_id));
    const registeredCredits = registeredRes.rows.reduce((acc, r) => acc + r.credits, 0);

    // 4. Get all catalog courses
    const coursesRes = await query(
      `SELECT c.id, c.code, c.name, c.credits, c.department_id, c.semester, c.description, c.is_core,
              d.name as department_name
       FROM courses c
       JOIN departments d ON d.id = c.department_id
       ORDER BY c.semester ASC, c.is_core DESC`
    );

    // 5. Get all prerequisites
    const prereqsRes = await query(
      `SELECT p.course_id, p.prerequisite_course_id, pr.code as prereq_code, pr.name as prereq_name
       FROM prerequisites p
       JOIN courses pr ON pr.id = p.prerequisite_course_id`
    );

    const prereqMap = new Map<number, { prereqId: number; prereqCode: string; prereqName: string }[]>();
    for (const p of prereqsRes.rows) {
      const list = prereqMap.get(p.course_id) || [];
      list.push({
        prereqId: p.prerequisite_course_id,
        prereqCode: p.prereq_code,
        prereqName: p.prereq_name
      });
      prereqMap.set(p.course_id, list);
    }

    // 6. Evaluate and score recommendations
    const recommendations: AcademicRecommendation[] = [];

    for (const course of coursesRes.rows) {
      // Exclude courses already completed or currently registered
      if (completedIds.has(course.id) || registeredIds.has(course.id)) {
        continue;
      }

      const reqs = prereqMap.get(course.id) || [];
      let allPrereqsSatisfied = true;
      const checkedPrereqs = reqs.map((p) => {
        const satisfied = completedIds.has(p.prereqId);
        if (!satisfied) allPrereqsSatisfied = false;
        return {
          prereqCode: p.prereqCode,
          prereqName: p.prereqName,
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
        if (reqs.length > 0) {
          const satisfiedNames = checkedPrereqs.map((cp) => cp.prereqCode).join(', ');
          reasons.push(`All prerequisites satisfied: ${satisfiedNames} ✓`);
        } else {
          reasons.push('No prerequisites required — open enrollment.');
        }
      } else {
        priorityScore -= 100;
        const missing = checkedPrereqs.filter((cp) => !cp.satisfied).map((cp) => cp.prereqCode).join(', ');
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
        departmentName: course.department_name,
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
        studentIdString: student.code,
        studentName: student.student_name,
        semester: student.semester,
        completedCredits,
        registeredCredits,
        maxCredits: student.max_credits,
        currentGpa: parseFloat(student.current_gpa)
      }
    };
  }
}
