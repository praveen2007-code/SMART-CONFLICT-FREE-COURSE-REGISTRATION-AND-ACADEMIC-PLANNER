import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints with ADMIN role guard
router.use(authenticateJwt);
router.use(requireRole('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/registrations', AdminController.getRegistrations);
router.get('/department-analytics', AdminController.getDepartmentAnalytics);

router.post('/courses', AdminController.createCourse);
router.post('/clear-all-courses', AdminController.clearAllCourses);
router.post('/populate-all-courses', AdminController.populateAllCourses);
router.put('/courses/:id', AdminController.updateCourse);
router.delete('/courses/:id', AdminController.deleteCourse);

router.post('/sections', AdminController.createSection);
router.put('/sections/:id', AdminController.updateSection);

router.post('/clear-student-data', AdminController.clearStudentData);

export default router;
