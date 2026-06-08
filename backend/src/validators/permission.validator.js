import Joi from 'joi';

export const createPermissionSchema = Joi.object({
    name: Joi.string().required().pattern(/^[a-z_]+$/).messages({
        'string.empty': 'Permission name is required',
        'string.pattern.base': 'Permission name can only contain lowercase letters and underscores (e.g., manage_users)'
    }),
    description: Joi.string().optional().allow(null, ''),
    module: Joi.string().required().messages({
        'string.empty': 'Module name is required'
    })
});

export const updatePermissionSchema = Joi.object({
    name: Joi.string().optional().pattern(/^[a-z_]+$/).messages({
        'string.pattern.base': 'Permission name can only contain lowercase letters and underscores (e.g., manage_users)'
    }),
    description: Joi.string().optional().allow(null, ''),
    module: Joi.string().optional()
});
