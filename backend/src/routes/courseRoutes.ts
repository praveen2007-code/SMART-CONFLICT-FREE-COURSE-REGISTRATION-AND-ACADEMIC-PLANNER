import { Router } from 'express';
import { CourseController } from '../controllers/courseController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// Courses list can be accessed with optional authentication for personalized prereq satisfaction
router.get('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJwt(req, res, next);
  }
  next();
}, CourseController.getCourses);

router.get('/:id', CourseController.getCourseById);
router.get('/:id/prerequisites', CourseController.getPrerequisites);
router.get('/:id/seats', CourseController.getSeats);

export default router;
