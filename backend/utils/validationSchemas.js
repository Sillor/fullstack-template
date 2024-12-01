const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(5)
        .max(30)
        .required()
        .messages({
            'string.alphanum': 'Username must only contain alphanumeric characters.',
            'string.min': 'Username must be at least 5 characters long.',
            'string.max': 'Username must not exceed 30 characters.',
            'any.required': 'Username is required.'
        }),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$'))
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long.',
            'string.pattern.base': 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'any.required': 'Password is required.'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Email must be a valid email address.',
            'any.required': 'Email is required.'
        })
});

const loginSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.alphanum': 'Username must only contain alphanumeric characters.',
            'string.min': 'Username must be at least 3 characters long.',
            'string.max': 'Username must not exceed 30 characters.',
            'any.required': 'Username is required.'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required.'
        })
});

const resetPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Email must be a valid email address.',
            'any.required': 'Email is required.'
        })
});

const newPasswordSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Token is required.'
        }),
    newPassword: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$'))
        .required()
        .messages({
            'string.min': 'New password must be at least 8 characters long.',
            'string.pattern.base': 'New password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'any.required': 'New password is required.'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    resetPasswordSchema,
    newPasswordSchema
};
