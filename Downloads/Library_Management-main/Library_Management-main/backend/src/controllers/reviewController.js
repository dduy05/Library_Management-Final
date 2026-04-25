import ReviewModel from '../models/ReviewModel.js';
import AppError from '../utils/AppError.js';

export const createReview = async (req, res, next) => {
    try {
        const { book_id, rating, comment } = req.body;
        const user_id = req.user.id;
        
        // [VALIDATION] Rating 1-5, Comment min 10 chars
        if (!rating || rating < 1 || rating > 5) {
            return next(new AppError('Số sao đánh giá phải từ 1 đến 5.', 400));
        }
        if (!comment || comment.trim().length < 10) {
            return next(new AppError('Bình luận phải có ít nhất 10 ký tự.', 400));
        }

        // [LOGIC] Check eligibility via Model
        const canReview = await ReviewModel.checkUserCanReview(user_id, book_id);
        if (!canReview) {
            return next(new AppError('Bạn chỉ có thể đánh giá những cuốn sách mình đã từng mượn.', 403));
        }

        const review = await ReviewModel.create({
            book_id,
            user_id,
            rating,
            comment
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

export const getBookReviews = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const reviews = await ReviewModel.findByBookId(bookId);

        res.json({ success: true, data: reviews });
    } catch (error) {
        next(error);
    }
};
