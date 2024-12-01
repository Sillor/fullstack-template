const Joi = require('joi');

// Constants for common patterns and messages
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const messages = {
    alphanum: 'Username must only contain alphanumeric characters.',
    minLength: (field, min) => `${field} must be at least ${min} characters long.`,
    maxLength: (field, max) => `${field} must not exceed ${max} characters.`,
    required: (field) => `${field} is required.`,
    validEmail: 'Email must be a valid email address.',
    passwordStrength: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
};

// Helper to generate Joi field validation with consistent messaging
const usernameField = (min, max) =>
    Joi.string()
        .alphanum()
        .min(min)
        .max(max)
        .required()
        .messages({
            'string.alphanum': messages.alphanum,
            'string.min': messages.minLength('Username', min),
            'string.max': messages.maxLength('Username', max),
            'any.required': messages.required('Username'),
        });

const passwordField = (fieldName = 'Password') =>
    Joi.string()
        .min(8)
        .pattern(passwordPattern)
        .required()
        .messages({
            'string.min': messages.minLength(fieldName, 8),
            'string.pattern.base': messages.passwordStrength,
            'any.required': messages.required(fieldName),
        });

const emailField = () =>
    Joi.string()
        .email()
        .required()
        .messages({
            'string.email': messages.validEmail,
            'any.required': messages.required('Email'),
        });

// Schemas
const registerSchema = Joi.object({
    username: usernameField(5, 30),
    password: passwordField(),
    email: emailField(),
});

const loginSchema = Joi.object({
    username: usernameField(3, 30),
    password: Joi.string().required().messages({
        'any.required': messages.required('Password'),
    }),
});

const resetPasswordSchema = Joi.object({
    email: emailField(),
});

const newPasswordSchema = Joi.object({
    token: Joi.string().required().messages({
        'any.required': messages.required('Token'),
    }),
    newPassword: passwordField('New password'),
});

module.exports = {
    registerSchema,
    loginSchema,
    resetPasswordSchema,
    newPasswordSchema,
};
