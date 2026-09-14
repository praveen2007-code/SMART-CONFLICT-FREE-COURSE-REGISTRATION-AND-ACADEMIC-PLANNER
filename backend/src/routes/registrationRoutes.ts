import { Router } from 'express';
import { RegistrationController } from '../controllers/registrationController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);

// Student registration
router.post('/', RegistrationController.register);

// Drop registered course
router.delete('/:id', RegistrationController.drop);

// View active registrations for student
router.get('/student/:studentId', RegistrationController.getStudentRegistrations);

// View registration history audit logs
router.get('/history/:studentId', RegistrationController.getHistory);

export default router;
