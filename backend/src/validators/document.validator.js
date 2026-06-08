import Joi from 'joi';

export const createDocumentTemplateSchema = Joi.object({
    name: Joi.string().required().trim(),
    docType: Joi.string().required().trim(),
    fileType: Joi.string().allow('', null).trim(),
    templateContent: Joi.string().allow('', null),
    shortcodes: Joi.array().items(Joi.string()).default([]),
    description: Joi.string().allow('', null).trim(),
    isActive: Joi.boolean().default(true)
});

export const updateDocumentTemplateSchema = Joi.object({
    name: Joi.string().trim().optional(),
    docType: Joi.string().trim().optional(),
    fileType: Joi.string().allow('', null).trim().optional(),
    templateContent: Joi.string().allow('', null).optional(),
    shortcodes: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().allow('', null).trim().optional(),
    isActive: Joi.boolean().optional()
});

export const queryDocumentTemplateSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    search: Joi.string().optional(),
    docType: Joi.string().optional(),
    isActive: Joi.boolean().optional()
});

export const generateDocumentSchema = Joi.object({
    templateId: Joi.string().required(),
    studentId: Joi.string().required()
});
