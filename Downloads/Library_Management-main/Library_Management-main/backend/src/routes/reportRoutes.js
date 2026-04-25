import express from 'express';
import { exportInventoryReport, exportBorrowReport } from '../controllers/reportController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tất cả các route báo cáo đều yêu cầu quyền Admin
router.get('/inventory', verifyToken, verifyAdmin, exportInventoryReport);
router.get('/borrows', verifyToken, verifyAdmin, exportBorrowReport);

export default router;
