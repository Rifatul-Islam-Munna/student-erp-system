import Joi from 'joi';

export const updateSettingSchema = Joi.object({
    site: Joi.object({
        name: Joi.string().optional(),
        logo: Joi.string().allow(null, '').optional(),
        address: Joi.string().allow(null, '').optional(),
        phone: Joi.string().allow(null, '').optional(),
        email: Joi.string().email().allow(null, '').optional(),
        maintenance_mode: Joi.boolean().optional(),
        maintenance_message: Joi.string().allow(null, '').optional(),
        academic_year: Joi.string().optional()
    }).optional(),
    intake_months: Joi.array().items(Joi.string()).optional(),
    visatypes: Joi.array().items(Joi.string()).optional(),
    visiting_sources: Joi.array().items(Joi.string()).optional(),
    edu_degrees: Joi.array().items(Joi.string()).optional(),
    exam_types: Joi.array().items(Joi.string()).optional(),
    countries: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        logoUrl: Joi.string().allow(null, '').optional(),
        logoFile: Joi.string().allow(null, '').optional()
    })).optional(),
    event_categories: Joi.array().items(Joi.string()).optional(),
    faq_categories: Joi.array().items(Joi.string()).optional()
});
