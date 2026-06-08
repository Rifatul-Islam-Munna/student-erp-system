import Joi from 'joi';

export const createUserSchema = Joi.object({
    fullName: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().allow(null, '').trim(),
    role: Joi.string().valid('super_admin', 'admin', 'counselor', 'agent', 'student', 'branch').required(),
    accountStatus: Joi.string().valid('active', 'inactive', 'suspended').default('active'),
    permissions: Joi.array().items(Joi.string()).optional(),
    branch: Joi.string().allow(null, ''),
    address: Joi.string().allow(null, '').trim(),
    commissionType: Joi.string().valid('fixed', 'percentage', '').default(''),
    commissionAmount: Joi.number().default(0)
});

export const updateUserSchema = Joi.object({
    fullName: Joi.string().min(2).max(100).trim().optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    phone: Joi.string().allow(null, '').trim().optional(),
    role: Joi.string().valid('super_admin', 'admin', 'counselor', 'agent', 'student', 'branch').optional(),
    accountStatus: Joi.string().valid('active', 'inactive', 'suspended').optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
    branch: Joi.string().allow(null, '').optional(),
    address: Joi.string().allow(null, '').trim().optional(),
    commissionType: Joi.string().valid('fixed', 'percentage', '').optional(),
    commissionAmount: Joi.number().optional(),
    totalEarnings: Joi.number().optional()
});

export const queryUserSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    search: Joi.string().optional(),
    role: Joi.string().optional(),
    accountStatus: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});
