import NotificationModel from '../models/NotificationModel.js';

export const getMyNotifications = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const notifications = await NotificationModel.findByUserId(user_id);

        res.json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await NotificationModel.markAsRead(id);

        res.json({ success: true, message: 'Đã đánh dấu là đã đọc.' });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        await NotificationModel.markAllAsRead(user_id);

        res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc.' });
    } catch (error) {
        next(error);
    }
};
