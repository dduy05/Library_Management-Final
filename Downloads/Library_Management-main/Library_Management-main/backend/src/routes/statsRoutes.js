import express from 'express';
import { getSummary, getUserSummary } from '../controllers/statsController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin xem tổng quát
router.get('/summary', verifyToken, verifyAdmin, getSummary);
// Student xem stats cá nhân
router.get('/user', verifyToken, getUserSummary);

export default router;
