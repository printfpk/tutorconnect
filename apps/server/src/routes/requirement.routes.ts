import { Router } from 'express';
import { authenticate, authenticateAndLoadUser } from '../middleware/auth.middleware.js';
import { requirementController, flashController } from '../controllers/requirement.controller.js';

/* ═══════════════════════════════════════
   REQUIREMENTS  /api/v1/requirements
═══════════════════════════════════════ */
const requirementRouter = Router();
requirementRouter.use(authenticate); // all requirement routes require login

requirementRouter.get('/discover', authenticateAndLoadUser, requirementController.discover);
requirementRouter.get('/nearby', requirementController.getNearby);
requirementRouter.get('/mine', requirementController.getMine);
requirementRouter.get('/offers/mine', requirementController.getMyOffers);
requirementRouter.post('/', requirementController.create);
requirementRouter.get('/:id', requirementController.getById);
requirementRouter.put('/:id', requirementController.update);
requirementRouter.delete('/:id', requirementController.close);
requirementRouter.post('/:id/offer', requirementController.sendOffer);
requirementRouter.get('/:id/offers', requirementController.getOffers);

/* ═══════════════════════════════════════
   FLASH REQUESTS  /api/v1/flash
═══════════════════════════════════════ */
const flashRouter = Router();
flashRouter.use(authenticate);

flashRouter.get('/nearby', flashController.getNearby);
flashRouter.get('/mine', flashController.getMine);
flashRouter.post('/', flashController.create);
flashRouter.get('/:id', flashController.getById);
flashRouter.post('/:id/respond', flashController.respond);

export { requirementRouter, flashRouter };
