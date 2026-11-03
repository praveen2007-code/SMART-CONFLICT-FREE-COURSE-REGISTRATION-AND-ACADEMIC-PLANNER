"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationController = void 0;
const zod_1 = require("zod");
const models_1 = require("../models");
const seatService_1 = require("../services/seatService");
const plannerService_1 = require("../services/plannerService");
const registerCourseSchema = zod_1.z.object({
    sectionId: zod_1.z.number().int().positive('Valid section ID is required'),
    studentId: zod_1.z.number().int().positive().optional()
});
class RegistrationController {
    /**
     * Register a student for a course section
     * Strictly enforces: Prerequisite check, Duplicate check, Credit limit, Time collisions, Seat availability, Concurrency
     */
    static async register(req, res) {
        const data = registerCourseSchema.parse(req.body);
        const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : data.studentId;
        if (!studentId) {
            res.status(400).json({ success: false, error: 'Student ID could not be identified.' });
            return;
        }
        // 1. Fetch section and course info
        const section = await models_1.CourseSection.findOne({ id: data.sectionId });
        if (!section) {
            res.status(404).json({ success: false, error: 'Course section not found.' });
            return;
        }
        const course = await models_1.Course.findOne({ id: section.course_id });
        if (!course) {
            res.status(404).json({ success: false, error: 'Course not found.' });
            return;
        }
        // 2. Fetch student profile
        const student = await models_1.Student.findOne({ id: studentId });
        if (!student) {
            res.status(404).json({ success: false, error: 'Student profile not found.' });
            return;
        }
        // 3. Rule: Check if student already completed this course
        const completed = await models_1.CompletedCourse.findOne({ student_id: studentId, course_id: course.id });
        if (completed) {
            res.status(400).json({
                success: false,
                error: `Cannot register: You have already completed ${course.code} in a previous semester.`
            });
            return;
        }
        // 4. Rule: Check if student is already registered for this course (any section)
        const activeEnrollments = await models_1.Enrollment.find({ student_id: studentId, status: 'REGISTERED' });
        const activeSectionIds = activeEnrollments.map((e) => e.section_id);
        const registeredSections = await models_1.CourseSection.find({ id: { $in: activeSectionIds } });
        const duplicateCourse = registeredSections.find((s) => s.course_id === course.id);
        if (duplicateCourse) {
            res.status(409).json({
                success: false,
                error: `You are already registered for ${course.code} (${duplicateCourse.section_code}). Duplicate registration is not permitted.`
            });
            return;
        }
        // 5. Rule: Check Prerequisites
        const prereqCheck = await plannerService_1.PlannerService.checkPrerequisites(studentId, [course.id]);
        const coursePrereq = prereqCheck[0];
        if (coursePrereq && !coursePrereq.satisfied) {
            res.status(400).json({
                success: false,
                error: `Prerequisite requirement not satisfied! You must complete: ${coursePrereq.missingPrereqs.join(', ')} before registering for ${course.code}.`
            });
            return;
        }
        // 6. Rule: Check Credit Limit
        const registeredCourseIds = registeredSections.map((s) => s.course_id);
        const registeredCourses = await models_1.Course.find({ id: { $in: registeredCourseIds } });
        const currentCredits = registeredCourses.reduce((sum, c) => sum + c.credits, 0);
        if (currentCredits + course.credits > student.max_credits) {
            res.status(400).json({
                success: false,
                error: `Credit limit exceeded! Current: ${currentCredits} credits, Course: ${course.credits} credits. Max allowed: ${student.max_credits} credits.`
            });
            return;
        }
        // 7. Rule: Check Time Collision with existing registered courses
        if (activeSectionIds.length > 0) {
            const conflictCheck = await plannerService_1.PlannerService.checkConflicts([...activeSectionIds, section.id]);
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
        const reservation = await seatService_1.SeatService.reserveSeat(studentId, section.id);
        if (!reservation.success) {
            res.status(409).json({
                success: false,
                error: reservation.message || 'Course section is full.'
            });
            return;
        }
        // 9. Persist in MongoDB
        try {
            let existingRecord = await models_1.Enrollment.findOne({ student_id: studentId, section_id: section.id });
            let enrollmentId;
            if (existingRecord) {
                existingRecord.status = 'REGISTERED';
                existingRecord.enrolled_at = new Date();
                existingRecord.dropped_at = undefined;
                await existingRecord.save();
                enrollmentId = existingRecord.id;
            }
            else {
                const lastEnr = await models_1.Enrollment.findOne().sort({ id: -1 });
                enrollmentId = (lastEnr?.id || 0) + 1;
                await models_1.Enrollment.create({
                    id: enrollmentId,
                    student_id: studentId,
                    section_id: section.id,
                    status: 'REGISTERED',
                    enrolled_at: new Date()
                });
            }
            // Increment enrolled count on section document
            await models_1.CourseSection.updateOne({ id: section.id }, { $inc: { enrolled_count: 1 } });
            // Audit Log
            const lastLog = await models_1.RegistrationLog.findOne().sort({ id: -1 });
            const nextLogId = (lastLog?.id || 0) + 1;
            await models_1.RegistrationLog.create({
                id: nextLogId,
                student_id: studentId,
                section_id: section.id,
                action: 'ENROLL',
                status: 'SUCCESS',
                details: JSON.stringify({
                    courseCode: course.code,
                    sectionCode: section.section_code,
                    credits: course.credits,
                    registeredAt: new Date().toISOString()
                })
            });
            // Release idempotency lock
            await seatService_1.SeatService.releaseLock(studentId, section.id);
            // Get updated seat count
            const seatInfo = await seatService_1.SeatService.getAvailableSeats(section.id);
            res.status(201).json({
                success: true,
                message: `Successfully registered for ${course.code} - ${course.name} (${section.section_code})!`,
                enrollment: {
                    id: enrollmentId,
                    courseCode: course.code,
                    courseName: course.name,
                    sectionCode: section.section_code,
                    credits: course.credits,
                    availableSeats: seatInfo.available,
                    seatStatus: seatInfo.status
                }
            });
        }
        catch (err) {
            // Rollback Redis seat decrement
            await seatService_1.SeatService.releaseSeat(section.id);
            await seatService_1.SeatService.releaseLock(studentId, section.id);
            throw err;
        }
    }
    /**
     * Drop a registered course
     * Updates MongoDB status to DROPPED and increments Redis seat count
     */
    static async drop(req, res) {
        const enrollmentId = parseInt(req.params.id, 10);
        if (isNaN(enrollmentId)) {
            res.status(400).json({ success: false, error: 'Invalid enrollment ID' });
            return;
        }
        const studentId = req.user?.studentId;
        const enrollment = await models_1.Enrollment.findOne({ id: enrollmentId });
        if (!enrollment) {
            res.status(404).json({ success: false, error: 'Registration record not found.' });
            return;
        }
        if (req.user?.role === 'STUDENT' && enrollment.student_id !== studentId) {
            res.status(403).json({ success: false, error: 'You are not authorized to drop this course.' });
            return;
        }
        if (enrollment.status === 'DROPPED') {
            res.status(400).json({ success: false, error: 'This course is already dropped.' });
            return;
        }
        enrollment.status = 'DROPPED';
        enrollment.dropped_at = new Date();
        await enrollment.save();
        // Decrement section enrolled count
        await models_1.CourseSection.updateOne({ id: enrollment.section_id }, { $inc: { enrolled_count: -1 } });
        const section = await models_1.CourseSection.findOne({ id: enrollment.section_id });
        const course = section ? await models_1.Course.findOne({ id: section.course_id }) : null;
        // Audit log
        const lastLog = await models_1.RegistrationLog.findOne().sort({ id: -1 });
        const nextLogId = (lastLog?.id || 0) + 1;
        await models_1.RegistrationLog.create({
            id: nextLogId,
            student_id: enrollment.student_id,
            section_id: enrollment.section_id,
            action: 'DROP',
            status: 'SUCCESS',
            details: JSON.stringify({
                courseCode: course?.code || 'COURSE',
                sectionCode: section?.section_code || 'SEC',
                droppedAt: new Date().toISOString()
            })
        });
        // Increment available seats in Redis
        await seatService_1.SeatService.releaseSeat(enrollment.section_id);
        const seatInfo = await seatService_1.SeatService.getAvailableSeats(enrollment.section_id);
        res.json({
            success: true,
            message: `Successfully dropped ${course?.code || 'Course'} (${section?.section_code || ''}). Seat has been released.`,
            availableSeats: seatInfo.available,
            seatStatus: seatInfo.status
        });
    }
    /**
     * Get all active enrollments for a student
     */
    static async getStudentRegistrations(req, res) {
        const studentIdParam = parseInt(req.params.studentId, 10);
        const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : studentIdParam;
        if (!studentId) {
            res.status(400).json({ success: false, error: 'Valid student ID is required' });
            return;
        }
        const enrollments = await models_1.Enrollment.find({ student_id: studentId, status: 'REGISTERED' }).sort({ enrolled_at: -1 });
        const sectionIds = enrollments.map((e) => e.section_id);
        const sections = await models_1.CourseSection.find({ id: { $in: sectionIds } });
        const courseIds = sections.map((s) => s.course_id);
        const courses = await models_1.Course.find({ id: { $in: courseIds } });
        const departments = await models_1.Department.find();
        const courseMap = new Map();
        courses.forEach((c) => courseMap.set(c.id, c));
        const deptMap = new Map();
        departments.forEach((d) => deptMap.set(d.id, d.name));
        const sectionMap = new Map();
        sections.forEach((s) => sectionMap.set(s.id, s));
        const registrations = enrollments.map((e) => {
            const sec = sectionMap.get(e.section_id);
            const c = sec ? courseMap.get(sec.course_id) : null;
            const deptName = c ? deptMap.get(c.department_id) || 'Computer Science' : 'Computer Science';
            return {
                enrollmentId: e.id,
                courseId: c?.id || 0,
                courseCode: c?.code || 'UNKNOWN',
                courseName: c?.name || 'Unknown Course',
                credits: c?.credits || 3,
                semester: c?.semester || 1,
                departmentName: deptName,
                sectionId: sec?.id || e.section_id,
                sectionCode: sec?.section_code || 'SEC',
                facultyName: sec?.faculty_name || '',
                roomNumber: sec?.room_number || '',
                enrolledAt: e.enrolled_at,
                schedules: sec?.schedules || []
            };
        });
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
    static async getHistory(req, res) {
        const studentIdParam = parseInt(req.params.studentId, 10);
        const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : studentIdParam;
        if (!studentId) {
            res.status(400).json({ success: false, error: 'Valid student ID is required' });
            return;
        }
        const logs = await models_1.RegistrationLog.find({ student_id: studentId }).sort({ created_at: -1 });
        const formattedHistory = logs.map((l) => {
            let detailsObj = {};
            try {
                detailsObj = JSON.parse(l.details);
            }
            catch (e) {
                detailsObj = {};
            }
            return {
                id: l.id,
                student_id: l.student_id,
                action: l.action,
                course_code: detailsObj.courseCode || 'COURSE',
                course_name: detailsObj.courseCode || 'Academic Registration',
                details: l.details,
                created_at: l.created_at
            };
        });
        res.json({
            success: true,
            history: formattedHistory
        });
    }
}
exports.RegistrationController = RegistrationController;
