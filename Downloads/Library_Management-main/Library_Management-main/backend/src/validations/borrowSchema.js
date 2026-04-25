import Joi from 'joi';

export const borrowRequestSchema = Joi.object({
    book_id: Joi.number().integer().required(),
    due_date: Joi.date().greater('now').required().messages({
        'date.greater': 'Ngày hạn trả phải lớn hơn ngày hiện tại'
    })
});

export const updateBorrowStatusSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected', 'returned').required()
});
