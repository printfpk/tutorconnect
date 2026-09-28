import { Router } from 'express';
import { getTutors } from '../controllers/tutor.controller.js';
import { authenticateAndLoadUser } from '../middleware/auth.middleware.js';

const router = Router();

// We use authenticateAndLoadUser so we can access req.user.pincode
router.get('/', authenticateAndLoadUser, getTutors);

export { router as tutorRouter };
