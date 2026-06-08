import Joi from 'joi';

export const registerSchema = Joi.object({
    fullName: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name must be at most 100 characters'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long'
    }),
    phone: Joi.string().optional().allow(null, ''),
    role: Joi.string().valid('student', 'admin', 'branch').default('student').messages({
        'any.only': 'Role must be one of: student, admin, branch'
    })
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Please enter your password'
    })
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email'
    })
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long'
    })
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long'
    })
});
