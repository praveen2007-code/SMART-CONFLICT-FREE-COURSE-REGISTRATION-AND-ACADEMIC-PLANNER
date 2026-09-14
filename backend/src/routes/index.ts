import { Router } from 'express';
import authRoutes from './authRoutes';
import courseRoutes from './courseRoutes';
import registrationRoutes from './registrationRoutes';
import plannerRoutes from './plannerRoutes';
import recommendationRoutes from './recommendationRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Smart Course Registration API'
  });
});

// Mounted Routes
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/registrations', registrationRoutes);
router.use('/planner', plannerRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/admin', adminRoutes);

export default router;
