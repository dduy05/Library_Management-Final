import BookModel from '../models/BookModel.js';
import CategoryModel from '../models/CategoryModel.js';
import { bookSchema } from '../validations/bookSchema.js';
import AppError from '../utils/AppError.js';

export const getAllBooks = async (req, res, next) => {
    try {
        const showDeleted = req.query.show_deleted === 'true';
        const books = await BookModel.findAll(showDeleted);
        res.json({ success: true, data: books });
    } catch (error) {
        next(error);
    }
};

export const getBookById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await BookModel.findById(id);

        if (!book) {
            return next(new AppError('Không tìm thấy sách.', 404));
        }

        res.json({ success: true, data: book });
    } catch (error) {
        next(error);
    }
};

export const createBook = async (req, res, next) => {
    try {
        const body = { ...req.body };

        // 1. Chuyển đổi các trường số (vì FormData gửi dữ liệu dạng String)
        if (body.category_id) body.category_id = parseInt(body.category_id);
        if (body.available_count) body.available_count = parseInt(body.available_count);
        if (body.total_count) body.total_count = parseInt(body.total_count);
        if (body.published_year) body.published_year = parseInt(body.published_year);
        if (body.rating) body.rating = parseFloat(body.rating);

        // 2. Xử lý ảnh bìa từ Cloudinary
        if (req.file) {
            body.cover_image = req.file.path;
        } else if (!body.cover_image) {
            body.cover_image = '';
        }

        const { error } = bookSchema.validate(body);
        if (error) return next(new AppError(error.details[0].message, 400));

        const book = await BookModel.create(body);
        res.status(201).json({ success: true, data: book });
    } catch (error) {
        next(error);
    }
};

export const updateBook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = { ...req.body };

        // 1. Chuyển đổi dữ liệu số
        if (body.category_id) body.category_id = parseInt(body.category_id);
        if (body.available_count) body.available_count = parseInt(body.available_count);
        if (body.total_count) body.total_count = parseInt(body.total_count);
        if (body.published_year) body.published_year = parseInt(body.published_year);
        if (body.rating) body.rating = parseFloat(body.rating);

        // 2. Nếu có file mới được upload
        if (req.file) {
            body.cover_image = req.file.path;
        }

        const { error } = bookSchema.validate(body);
        if (error) return next(new AppError(error.details[0].message, 400));

        const book = await BookModel.update(id, body);
        if (!book) {
            return next(new AppError('Không tìm thấy sách để cập nhật.', 404));
        }

        res.json({ success: true, data: book });
    } catch (error) {
        next(error);
    }
};

/**
 * Xử lý Xóa vĩnh viễn (Hard Delete)
 */
export const hardDeleteBook = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Kiểm tra xem có ai đang mượn sách này không
        const activeCount = await BookModel.getActiveBorrowCount(id);
        if (activeCount > 0) {
            return next(new AppError(`Không thể xóa vĩnh viễn sách này vì đang có ${activeCount} yêu cầu mượn chưa hoàn thành.`, 400));
        }

        // 2. Tiến hành xóa vĩnh viễn
        const book = await BookModel.hardDelete(id);
        if (!book) {
            return next(new AppError('Không tìm thấy sách để xóa.', 404));
        }

        res.json({ success: true, message: 'Đã xóa vĩnh viễn sách khỏi cơ sở dữ liệu.' });
    } catch (error) {
        next(error);
    }
};

/**
 * Xử lý Xóa mềm kèm kiểm tra an toàn
 */
export const deleteBook = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Kiểm tra xem có ai đang mượn sách này không
        const activeCount = await BookModel.getActiveBorrowCount(id);
        if (activeCount > 0) {
            return next(new AppError(`Không thể xóa sách này vì đang có ${activeCount} yêu cầu mượn chưa hoàn thành (đang chờ duyệt hoặc đang mượn).`, 400));
        }

        // 2. Tiến hành xóa mềm
        const book = await BookModel.softDelete(id);
        if (!book) {
            return next(new AppError('Không tìm thấy sách để xóa.', 404));
        }

        res.json({ success: true, message: 'Đã ẩn sách khỏi hệ thống (Xóa mềm).' });
    } catch (error) {
        next(error);
    }
};

/**
 * Khôi phục sách đã xóa
 */
export const restoreBook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await BookModel.restore(id);

        if (!book) {
            return next(new AppError('Không tìm thấy sách để khôi phục.', 404));
        }

        res.json({ success: true, message: 'Đã khôi phục sách thành công.', data: book });
    } catch (error) {
        next(error);
    }
};
