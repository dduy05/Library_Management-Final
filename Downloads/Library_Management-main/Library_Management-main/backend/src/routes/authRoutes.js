import express from 'express';
import { login, register, getMe, getUsers, updateUserRole, updateUserStatus, resetUserPassword, changePassword } from '../controllers/authController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', verifyToken, getMe);
router.get('/users', verifyToken, verifyAdmin, getUsers);
router.put('/users/:id/role', verifyToken, verifyAdmin, updateUserRole);
router.put('/users/:id/status', verifyToken, verifyAdmin, updateUserStatus);
router.put('/users/:id/reset-password', verifyToken, verifyAdmin, resetUserPassword);
router.post('/change-password', verifyToken, changePassword);

export default router;
