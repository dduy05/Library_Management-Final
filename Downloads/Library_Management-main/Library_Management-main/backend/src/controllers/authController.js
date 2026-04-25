import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js';
import { loginSchema, registerSchema } from '../validations/authSchema.js';
import AppError from '../utils/AppError.js';

export const login = async (req, res, next) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return next(new AppError(error.details[0].message, 400));

        const { username, password } = req.body;
        const user = await UserModel.findByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError('Sai tài khoản hoặc mật khẩu.', 401));
        }

        if (user.is_active === false) {
            return next(new AppError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.', 403));
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const register = async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return next(new AppError(error.details[0].message, 400));

        const { username, password, full_name } = req.body;

        const userCheck = await UserModel.findByUsername(username);
        if (userCheck) {
            return next(new AppError('Tài khoản này đã tồn tại!', 400));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.create({
            username,
            password: hashedPassword,
            full_name,
            role: 'STUDENT'
        });

        res.status(201).json({ success: true, message: 'Đăng ký thành công!' });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    res.json({ success: true, user: req.user });
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.findAll();
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await UserModel.updateRole(id, role);

        if (!user) return next(new AppError('Người dùng không tồn tại.', 404));
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const user = await UserModel.updateStatus(id, is_active);

        if (!user) return next(new AppError('Người dùng không tồn tại.', 404));
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const resetUserPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) return next(new AppError('Vui lòng nhập mật khẩu mới.', 400));
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await UserModel.updatePassword(id, hashedPassword);

        if (!user) return next(new AppError('Người dùng không tồn tại.', 404));
        res.json({ success: true, message: 'Đã đặt lại mật khẩu thành công!' });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return next(new AppError('Vui lòng nhập đầy đủ mật khẩu cũ và mới.', 400));
        }

        // 1. Kiểm tra mật khẩu cũ
        const user = await UserModel.findById(userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(new AppError('Mật khẩu hiện tại không chính xác.', 401));
        }

        // 2. Hash mật khẩu mới và cập nhật
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.updatePassword(userId, hashedPassword);

        res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        next(error);
    }
};
