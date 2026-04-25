import express from 'express';
import { 
    createBorrowRequest, 
    updateBorrowStatus, 
    getMyBorrows, 
    getAllBorrowRequests,
    remindReturn
} from '../controllers/borrowController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createBorrowRequest);
router.get('/my', verifyToken, getMyBorrows);
router.get('/all', verifyToken, verifyAdmin, getAllBorrowRequests);
router.put('/:id/status', verifyToken, verifyAdmin, updateBorrowStatus);
router.post('/:id/remind', verifyToken, verifyAdmin, remindReturn);

export default router;
