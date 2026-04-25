import Joi from 'joi';

export const loginSchema = Joi.object({
    username: Joi.string().required().messages({
        'string.empty': 'Tên đăng nhập không được để trống'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Mật khẩu không được để trống'
    })
});

export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
        'string.min': 'Tên đăng nhập phải có ít nhất 3 ký tự',
        'string.empty': 'Tên đăng nhập không được để trống'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
        'string.empty': 'Mật khẩu không được để trống'
    }),
    full_name: Joi.string().allow('', null)
});
