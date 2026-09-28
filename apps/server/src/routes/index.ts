import { Router } from 'express';
import authRoutes from './auth.routes.js';
import { requirementRouter, flashRouter } from './requirement.routes.js';
import { tutorRouter } from './tutor.routes.js';
import { chatRouter } from './chat.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/requirements', requirementRouter);
router.use('/flash', flashRouter);
router.use('/tutors', tutorRouter);
router.use('/chats', chatRouter);

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

export default router;
