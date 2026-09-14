import { Router } from 'express';
import { PlannerController } from '../controllers/plannerController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.post('/check-conflicts', PlannerController.checkConflicts);
router.post('/generate', PlannerController.generateBestSchedule);

export default router;
