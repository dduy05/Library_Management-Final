import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import AppError from '../utils/AppError.js';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('Không tìm thấy token. Vui lòng đăng nhập!', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Token không hợp lệ hoặc đã hết hạn.', 403));
    }
};

export const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return next(new AppError('Chỉ Admin mới có quyền truy cập.', 403));
    }
    next();
};
