import Joi from 'joi';

export const createPartnerAgencySchema = Joi.object({
    agencyName: Joi.string().required().trim(),
    ownerName: Joi.string().required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    phone: Joi.string().required().trim(),
    address: Joi.string().allow('', null).trim(),
    website: Joi.string().allow('', null).trim(),
    type: Joi.string().valid('agent', 'sub-agent', 'corporate', 'other').default('agent'),
    commissionRate: Joi.number().min(0).default(0),
    isActive: Joi.boolean().default(true),
    branch: Joi.string().allow(null),
    notes: Joi.string().allow('', null).trim()
});

export const updatePartnerAgencySchema = Joi.object({
    agencyName: Joi.string().trim(),
    ownerName: Joi.string().trim(),
    email: Joi.string().email().trim().lowercase(),
    phone: Joi.string().trim(),
    address: Joi.string().allow('', null).trim(),
    website: Joi.string().allow('', null).trim(),
    type: Joi.string().valid('agent', 'sub-agent', 'corporate', 'other'),
    commissionRate: Joi.number().min(0),
    isActive: Joi.boolean(),
    branch: Joi.string().allow(null),
    notes: Joi.string().allow('', null).trim()
});

export const queryPartnerAgencySchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    type: Joi.string().valid('agent', 'sub-agent', 'corporate', 'other').optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
    branch: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});
