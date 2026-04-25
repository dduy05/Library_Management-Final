import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:bookId', reviewController.getBookReviews);
router.post('/', verifyToken, reviewController.createReview);

export default router;
