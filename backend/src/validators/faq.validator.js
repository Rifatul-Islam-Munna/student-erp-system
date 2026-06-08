import Joi from 'joi';

export const createFAQSchema = Joi.object({
    question: Joi.string().required().trim().min(5),
    answer: Joi.string().required().trim().min(5),
    category: Joi.string().trim().default('General'),
    branch: Joi.string().allow(null).optional(),
    isActive: Joi.boolean().default(true),
    priority: Joi.number().integer().default(0)
});

export const updateFAQSchema = Joi.object({
    question: Joi.string().trim().min(5),
    answer: Joi.string().trim().min(5),
    category: Joi.string().trim(),
    branch: Joi.string().allow(null),
    isActive: Joi.boolean(),
    priority: Joi.number().integer()
});

export const queryFAQSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(500).default(50),
    category: Joi.string().optional(),
    branch: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
    startDate: Joi.date().iso().optional(), // for createdAt filtering
    endDate: Joi.date().iso().optional()
});
