"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerController = void 0;
const zod_1 = require("zod");
const plannerService_1 = require("../services/plannerService");
const checkConflictsSchema = zod_1.z.object({
    sectionIds: zod_1.z.array(zod_1.z.number().int().positive()),
    studentId: zod_1.z.number().int().positive().optional()
});
const generatePlannerSchema = zod_1.z.object({
    courseIds: zod_1.z.array(zod_1.z.number().int().positive()),
    studentId: zod_1.z.number().int().positive().optional(),
    preferences: zod_1.z
        .object({
        preferredTime: zod_1.z.enum(['MORNING', 'AFTERNOON', 'ANY']).optional(),
        maxCredits: zod_1.z.number().int().positive().optional()
    })
        .optional()
});
class PlannerController {
    /**
     * Check for scheduling collisions and prerequisite issues
     */
    static async checkConflicts(req, res) {
        const data = checkConflictsSchema.parse(req.body);
        const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : data.studentId;
        const result = await plannerService_1.PlannerService.checkConflicts(data.sectionIds, studentId);
        res.json({
            success: true,
            scheduleStatus: result.hasConflicts ? 'Schedule Conflict Detected' : 'No conflicts',
            ...result
        });
    }
    /**
     * "Generate Best Schedule" Optimization
     */
    static async generateBestSchedule(req, res) {
        const data = generatePlannerSchema.parse(req.body);
        const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : data.studentId;
        if (!studentId) {
            res.status(400).json({ success: false, error: 'Student ID could not be identified' });
            return;
        }
        const result = await plannerService_1.PlannerService.generateBestSchedule(studentId, data.courseIds, data.preferences);
        res.json({
            success: true,
            ...result
        });
    }
}
exports.PlannerController = PlannerController;
