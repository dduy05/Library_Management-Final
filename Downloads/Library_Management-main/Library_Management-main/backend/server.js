import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getConnection } from './dbConfig.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import bookRoutes from './src/routes/bookRoutes.js';
import borrowRoutes from './src/routes/borrowRoutes.js';
import statsRoutes from './src/routes/statsRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import CronService from './src/services/cronService.js';

// Middleware
import errorMiddleware from './src/middleware/errorMiddleware.js';
import AppError from './src/utils/AppError.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Base Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Status Check
app.get('/api/status', (req, res) => {
    res.json({ message: "Backend API đang hoạt động mượt mà 🎉", status: "success" });
});

// App Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Xử lý Route không tồn tại
app.all('*', (req, res, next) => {
    next(new AppError(`Không tìm thấy đường dẫn ${req.originalUrl} trên máy chủ!`, 404));
});

app.use(errorMiddleware);

// Start Server
app.listen(PORT, async () => {
    console.log('');
    console.log(`===============================================`);
    console.log(`🚀 Library Backend API: http://localhost:${PORT}`);
    console.log(`===============================================`);

    try {
        await getConnection();
        console.log("✅ KẾT NỐI DATABASE THÀNH CÔNG!");

        // Khởi tạo hệ thống nhắc nhở tự động
        CronService.initCronJobs();
    } catch (error) {
        console.log("⚠️ CẢNH BÁO: Chưa truy cập được Database. Kiểm tra file .env!");
    }
});
