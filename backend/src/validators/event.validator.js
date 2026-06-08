import Joi from 'joi';

export const createEventSchema = Joi.object({
    title: Joi.string().required().trim().min(2).max(150),
    category: Joi.string().required().trim(),
    description: Joi.string().allow('', null).trim(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    location: Joi.string().allow('', null).trim(),
    branch: Joi.string().allow(null),
    status: Joi.string().valid('scheduled', 'cancelled', 'completed').default('scheduled')
});

export const updateEventSchema = Joi.object({
    title: Joi.string().trim().min(2).max(150),
    category: Joi.string().trim(),
    description: Joi.string().allow('', null).trim(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    location: Joi.string().allow('', null).trim(),
    branch: Joi.string().allow(null),
    status: Joi.string().valid('scheduled', 'cancelled', 'completed')
});

export const queryEventSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(500).default(50),
    category: Joi.string().optional(),
    branch: Joi.string().optional(),
    status: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    search: Joi.string().optional()
});
