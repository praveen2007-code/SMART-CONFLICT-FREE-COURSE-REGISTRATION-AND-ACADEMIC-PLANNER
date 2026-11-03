"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const models_1 = require("../models");
class RecommendationService {
    /**
     * Generates intelligent, personalized course recommendations for a student
     */
    static async getRecommendations(studentId) {
        // 1. Get student profile
        const student = await models_1.Student.findOne({ id: studentId });
        if (!student) {
            throw new Error('Student profile not found');
        }
        const user = await models_1.User.findOne({ id: student.user_id });
        const studentDept = await models_1.Department.findOne({ id: student.department_id });
        // 2. Get completed courses
        const completed = await models_1.CompletedCourse.find({ student_id: studentId });
        const completedIds = new Set(completed.map((r) => r.course_id));
        const allCourses = await models_1.Course.find();
        const courseMap = new Map();
        allCourses.forEach((c) => courseMap.set(c.id, c));
        const completedCredits = completed.reduce((acc, r) => {
            const c = courseMap.get(r.course_id);
            return acc + (c?.credits || 0);
        }, 0);
        // 3. Get currently registered courses
        const activeEnrollments = await models_1.Enrollment.find({ student_id: studentId, status: 'REGISTERED' });
        const activeSectionIds = activeEnrollments.map((e) => e.section_id);
        const activeSections = await models_1.CourseSection.find({ id: { $in: activeSectionIds } });
        const registeredIds = new Set(activeSections.map((s) => s.course_id));
        const registeredCredits = activeSections.reduce((acc, s) => {
            const c = courseMap.get(s.course_id);
            return acc + (c?.credits || 0);
        }, 0);
        // 4. Departments Map
        const departments = await models_1.Department.find();
        const deptMap = new Map();
        departments.forEach((d) => deptMap.set(d.id, d.name));
        // 5. Evaluate and score recommendations
        const recommendations = [];
        for (const course of allCourses) {
            // Exclude courses already completed or currently registered
            if (completedIds.has(course.id) || registeredIds.has(course.id)) {
                continue;
            }
            const reqIds = course.prerequisites || [];
            let allPrereqsSatisfied = true;
            const checkedPrereqs = reqIds.map((pId) => {
                const pCourse = courseMap.get(pId);
                const satisfied = completedIds.has(pId);
                if (!satisfied)
                    allPrereqsSatisfied = false;
                return {
                    prereqCode: pCourse?.code || `C-${pId}`,
                    prereqName: pCourse?.name || 'Prerequisite',
                    satisfied
                };
            });
            let priorityScore = 0;
            const reasons = [];
            // Reason 1: Semester progression match
            if (course.semester === student.semester) {
                priorityScore += 50;
                reasons.push(`Targeted for your current standing (Semester ${student.semester}).`);
            }
            else if (course.semester < student.semester) {
                priorityScore += 60; // Catching up on missed lower-division core!
                reasons.push(`Essential prior core requirement (Semester ${course.semester}).`);
            }
            else if (course.semester === student.semester + 1 && allPrereqsSatisfied) {
                priorityScore += 35;
                reasons.push(`Advance your degree pathway ahead of schedule.`);
            }
            // Reason 2: Core vs Elective
            if (course.is_core) {
                priorityScore += 40;
                reasons.push('Mandatory core curriculum requirement.');
            }
            else {
                priorityScore += 20;
            }
            // Reason 3: Prerequisite status
            if (allPrereqsSatisfied) {
                priorityScore += 50;
                if (reqIds.length > 0) {
                    const satisfiedNames = checkedPrereqs.map((cp) => cp.prereqCode).join(', ');
                    reasons.push(`All prerequisites satisfied: ${satisfiedNames} ✓`);
                }
                else {
                    reasons.push('No prerequisites required — open enrollment.');
                }
            }
            else {
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
            if (a.eligible !== b.eligible)
                return a.eligible ? -1 : 1;
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
exports.RecommendationService = RecommendationService;
