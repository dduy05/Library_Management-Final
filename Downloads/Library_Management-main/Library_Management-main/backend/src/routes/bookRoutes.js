import express from 'express';
import { getAllBooks, getBookById, createBook, updateBook, deleteBook, restoreBook, hardDeleteBook } from '../controllers/bookController.js';
import { importBooksFromExcel, downloadTemplate } from '../controllers/bookImportController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { imageUpload } from '../config/cloudinaryConfig.js';

// Cấu hình Multer để lưu file Excel tạm thời
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.xlsx' || ext === '.xls') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'), false);
        }
    }
});

const router = express.Router();

router.get('/', getAllBooks);
router.get('/template', downloadTemplate); // Route tải file mẫu
router.get('/:id', getBookById);

// Sử dụng imageUpload cho việc tạo và cập nhật sách
router.post('/', verifyToken, verifyAdmin, imageUpload.single('cover_image'), createBook);
router.put('/:id', verifyToken, verifyAdmin, imageUpload.single('cover_image'), updateBook);

// Giữ nguyên upload (local) cho việc nhập Excel
router.post('/import-excel', verifyToken, verifyAdmin, upload.single('file'), importBooksFromExcel);

router.delete('/:id', verifyToken, verifyAdmin, deleteBook);
router.delete('/:id/hard', verifyToken, verifyAdmin, hardDeleteBook);
router.patch('/:id/restore', verifyToken, verifyAdmin, restoreBook);

export default router;
