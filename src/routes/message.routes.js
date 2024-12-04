import express from 'express';  // Importar express
import { getMessages, saveMessage } from '../controllers/message.controller.js'; 
import authMiddleware from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/:userId/:contactId', authMiddleware, getMessages);

router.post('/', authMiddleware, saveMessage);

export default router;
