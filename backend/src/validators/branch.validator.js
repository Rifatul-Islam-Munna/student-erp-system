import Joi from 'joi';

export const createBranchSchema = Joi.object({
    name: Joi.string().required().trim().messages({
        'string.empty': 'Branch name is required'
    }),
    address: Joi.string().optional().allow(null, '').trim(),
    phone: Joi.string().optional().allow(null, '').trim(),
    email: Joi.string().email().optional().allow(null, '').trim(),
    status: Joi.string().valid('active', 'inactive').default('active')
});

export const updateBranchSchema = Joi.object({
    name: Joi.string().optional().trim(),
    address: Joi.string().optional().allow(null, '').trim(),
    phone: Joi.string().optional().allow(null, '').trim(),
    email: Joi.string().email().optional().allow(null, '').trim(),
    status: Joi.string().valid('active', 'inactive')
});
