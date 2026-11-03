"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationController = void 0;
const recommendationService_1 = require("../services/recommendationService");
class RecommendationController {
    static async getRecommendations(req, res) {
        const studentIdParam = parseInt(req.params.studentId, 10);
        const studentId = !isNaN(studentIdParam) ? studentIdParam : req.user?.studentId;
        if (!studentId) {
            res.status(400).json({ success: false, error: 'Valid student ID is required' });
            return;
        }
        const data = await recommendationService_1.RecommendationService.getRecommendations(studentId);
        res.json({
            success: true,
            ...data
        });
    }
}
exports.RecommendationController = RecommendationController;
