import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/events', eventController.createEvent);
router.get('/events', authMiddleware, eventController.getAllEvents);
router.get('/events/course/:courseId', eventController.getEventsByCourse);
router.delete('/events/:eventId', authMiddleware, eventController.deleteEvent);
router.get('/events/user', authMiddleware,eventController.getEventsForUser);

export default router;
