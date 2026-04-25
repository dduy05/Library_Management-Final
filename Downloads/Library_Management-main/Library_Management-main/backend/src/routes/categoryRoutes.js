import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.post('/', verifyToken, verifyAdmin, categoryController.createCategory);

export default router;
