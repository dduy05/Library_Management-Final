import Joi from 'joi';

export const bookSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    category_id: Joi.number().integer().required(),
    cover_image: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    available_count: Joi.number().min(0).default(0),
    total_count: Joi.number().min(0).default(0),
    published_year: Joi.number().integer().max(new Date().getFullYear()),
    rating: Joi.number().min(0).max(5).allow(null)
});
