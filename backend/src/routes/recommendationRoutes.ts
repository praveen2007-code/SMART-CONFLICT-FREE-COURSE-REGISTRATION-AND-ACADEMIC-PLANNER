import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/:studentId', RecommendationController.getRecommendations);

export default router;
