import { Router } from 'express';
import { getChats, getMessages, createOrGetChat, sendMessage } from '../controllers/chat.controller.js';
import { authenticateAndLoadUser } from '../middleware/auth.middleware.js';

const router = Router();

// All chat routes require authentication
router.use(authenticateAndLoadUser);

router.get('/', getChats);
router.post('/', createOrGetChat);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', sendMessage);

export { router as chatRouter };
