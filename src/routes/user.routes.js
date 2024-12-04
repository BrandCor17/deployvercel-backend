import express from 'express';
import * as userController from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { validateRegister } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/register', validateRegister, userController.register);
router.post('/verify-email', userController.verifyEmail);
router.post('/login', userController.login);
router.get('/me', authMiddleware, userController.getUserProfile);

router.get('/pending-requests', authMiddleware , userController.getPendingRequests);
router.patch('/approve-request/:id', userController.approveRequest);
router.put('/request-role', authMiddleware, userController.requestRoleChange);

router.get('/users', userController.getAllUsers);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/role', authMiddleware, userController.changeUserRole);
router.post('/create-admin', userController.createAdmin);

export default router;
