import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendationService';

export class RecommendationController {
  public static async getRecommendations(req: Request, res: Response): Promise<void> {
    const studentIdParam = parseInt(req.params.studentId as string, 10);
    const studentId = !isNaN(studentIdParam) ? studentIdParam : req.user?.studentId;

    if (!studentId) {
      res.status(400).json({ success: false, error: 'Valid student ID is required' });
      return;
    }

    const data = await RecommendationService.getRecommendations(studentId);

    res.json({
      success: true,
      ...data
    });
  }
}
