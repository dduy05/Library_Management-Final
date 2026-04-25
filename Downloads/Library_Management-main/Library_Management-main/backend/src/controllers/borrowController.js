import { getConnection } from '../../dbConfig.js';
import BorrowModel from '../models/BorrowModel.js';
import BookModel from '../models/BookModel.js';
import NotificationModel from '../models/NotificationModel.js';
import { borrowRequestSchema, updateBorrowStatusSchema } from '../validations/borrowSchema.js';
import AppError from '../utils/AppError.js';

export const createBorrowRequest = async (req, res, next) => {
    try {
        const { error } = borrowRequestSchema.validate(req.body);
        if (error) return next(new AppError(error.details[0].message, 400));

        const { book_id, due_date } = req.body;
        const user_id = req.user.id;
        const isEligible = await BorrowModel.checkEligibility(user_id);
        if (!isEligible) {
            return next(new AppError('Bạn đang có sách quá hạn hoặc khoản phạt chưa thanh toán. Vui lòng hoàn thành trước khi mượn sách mới.', 403));
        }

        // Kiểm tra sách có sẵn không
        const book = await BookModel.findById(book_id);
        if (!book) {
            return next(new AppError('Sách không tồn tại.', 404));
        }

        if (book.available_count <= 0) {
            return next(new AppError('Sách hiện đã hết, vui lòng quay lại sau.', 400));
        }

        // Tạo yêu cầu mượn
        const borrowRequest = await BorrowModel.create({
            user_id,
            book_id,
            due_date
        });

        res.status(201).json({ success: true, data: borrowRequest });
    } catch (error) {
        next(error);
    }
};

export const updateBorrowStatus = async (req, res, next) => {
    let pool;
    try {
        const { id } = req.params;
        const { error } = updateBorrowStatusSchema.validate(req.body);
        if (error) return next(new AppError(error.details[0].message, 400));

        const { status, is_paid } = req.body;
        pool = await getConnection();

        const data = await BorrowModel.findById(id);
        if (!data) {
            return next(new AppError('Yêu cầu mượn không tồn tại.', 404));
        }

        const oldStatus = data.status;
        const bookId = data.book_id;
        const userId = data.user_id;
        const bookTitle = data.title;

        await pool.query('BEGIN');

        let notificationMsg = '';
        let notificationType = 'info';
        let updateData = { status };

        if (oldStatus === 'pending' && status === 'approved') {
            await BookModel.updateAvailableCount(bookId, -1, pool);
            updateData.borrow_date = new Date();
            notificationMsg = `📑 Yêu cầu mượn sách "${bookTitle}" của bạn đã được DUYỆT. Hãy đến quầy để nhận sách.`;
            notificationType = 'success';
        }

        if (status === 'rejected') {
            notificationMsg = `❌ Yêu cầu mượn sách "${bookTitle}" của bạn đã bị TỪ CHỐI.`;
            notificationType = 'warning';
        }

        if (oldStatus === 'approved' && status === 'returned') {
            await BookModel.updateAvailableCount(bookId, 1, pool);
            updateData.return_date = new Date();
            
            // Tính tiền phạt
            const dueDate = new Date(data.due_date);
            const now = new Date();
            if (now > dueDate) {
                const diffDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
                const fine = diffDays * 5000;
                updateData.fine_amount = fine;
                updateData.is_paid = false;
                notificationMsg = `📚 Bạn đã trả sách "${bookTitle}" thành công. Bạn bị phạt ${fine.toLocaleString()}đ vì trả muộn ${diffDays} ngày.`;
                notificationType = 'warning';
            } else {
                notificationMsg = `📚 Bạn đã trả sách "${bookTitle}" thành công.`;
            }
        }

        if (is_paid === true && data.is_paid === false) {
            updateData.is_paid = true;
            notificationMsg = `💰 Khoản phạt cho sách "${bookTitle}" đã được xác nhận thanh toán. Chúc mừng bạn đã được mở khóa mượn sách!`;
            notificationType = 'success';
        }

        const updatedRequest = await BorrowModel.updateStatus(id, updateData, pool);

        // [TRIGGER] Tạo thông báo nếu có tin nhắn
        if (notificationMsg) {
            await NotificationModel.create({
                user_id: userId,
                message: notificationMsg,
                type: notificationType
            }, pool);
        }

        await pool.query('COMMIT');

        res.json({ success: true, data: updatedRequest });
    } catch (error) {
        if (pool) await pool.query('ROLLBACK');
        next(error);
    }
};

export const getMyBorrows = async (req, res, next) => {
    try {
        const borrows = await BorrowModel.findByUserId(req.user.id);
        res.json({ success: true, data: borrows });
    } catch (error) {
        next(error);
    }
};

export const getAllBorrowRequests = async (req, res, next) => {
    try {
        const borrows = await BorrowModel.findAll();
        res.json({ success: true, data: borrows });
    } catch (error) {
        next(error);
    }
};

export const remindReturn = async (req, res, next) => {
    try {
        const { id } = req.params;
        const borrow = await BorrowModel.findById(id);

        if (!borrow) {
            return next(new AppError('Phiếu mượn không tồn tại.', 404));
        }

        if (borrow.status !== 'approved') {
            return next(new AppError('Chỉ có thể nhắc nhở cho các sách đang được mượn.', 400));
        }

        const message = `🔔 Nhắc nhở từ Thư viện: Bạn đang mượn sách "**${borrow.title}**". Vui lòng lưu ý hạn trả sách để tránh phát sinh tiền phạt nhé!`;

        await NotificationModel.create({
            user_id: borrow.user_id,
            message: message,
            type: 'warning'
        });

        res.json({ success: true, message: 'Đã gửi thông báo nhắc nhở thành công.' });
    } catch (error) {
        next(error);
    }
};
