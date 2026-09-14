import { Request, Response } from 'express';
import { z } from 'zod';
import { PlannerService } from '../services/plannerService';

const checkConflictsSchema = z.object({
  sectionIds: z.array(z.number().int().positive()),
  studentId: z.number().int().positive().optional()
});

const generatePlannerSchema = z.object({
  courseIds: z.array(z.number().int().positive()),
  studentId: z.number().int().positive().optional(),
  preferences: z
    .object({
      preferredTime: z.enum(['MORNING', 'AFTERNOON', 'ANY']).optional(),
      maxCredits: z.number().int().positive().optional()
    })
    .optional()
});

export class PlannerController {
  /**
   * Check for scheduling collisions and prerequisite issues
   */
  public static async checkConflicts(req: Request, res: Response): Promise<void> {
    const data = checkConflictsSchema.parse(req.body);
    const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : data.studentId;

    const result = await PlannerService.checkConflicts(data.sectionIds, studentId);

    res.json({
      success: true,
      scheduleStatus: result.hasConflicts ? 'Schedule Conflict Detected' : 'No conflicts',
      ...result
    });
  }

  /**
   * "Generate Best Schedule" Optimization
   */
  public static async generateBestSchedule(req: Request, res: Response): Promise<void> {
    const data = generatePlannerSchema.parse(req.body);
    const studentId = req.user?.role === 'STUDENT' ? req.user.studentId : data.studentId;

    if (!studentId) {
      res.status(400).json({ success: false, error: 'Student ID could not be identified' });
      return;
    }

    const result = await PlannerService.generateBestSchedule(studentId, data.courseIds, data.preferences);

    res.json({
      success: true,
      ...result
    });
  }
}
