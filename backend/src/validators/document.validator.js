import Joi from 'joi';

export const createDocumentTemplateSchema = Joi.object({
    name: Joi.string().required().trim(),
    docType: Joi.string().valid('system', 'student', 'other').required().trim(),
    documentFormat: Joi.string().valid('html', 'pdf', 'xlsx', 'fillable_pdf', 'docx').default('html'),
    fileType: Joi.string().allow('', null).trim(),
    templateContent: Joi.string().allow('', null),
    backgroundImageUrl: Joi.string().allow('', null),
    shortcodes: Joi.array().items(Joi.string()).default([]),
    description: Joi.string().allow('', null).trim(),
    customFonts: Joi.array().items(
        Joi.object({
            family: Joi.string().required().trim(),
            label: Joi.string().required().trim(),
            source: Joi.string().required()
        })
    ).default([]),
    status: Joi.string().valid('draft', 'active', 'inactive').default('draft'),
    isActive: Joi.boolean().default(true),
    pageSettings: Joi.object({
        preset: Joi.string().valid('A4', 'A3', 'Letter', 'Legal', 'Custom').default('A4'),
        orientation: Joi.string().valid('portrait', 'landscape').default('portrait'),
        unit: Joi.string().valid('mm', 'in', 'px').default('mm'),
        widthMm: Joi.number().positive().optional(),
        heightMm: Joi.number().positive().optional(),
        marginTopMm: Joi.number().min(0).optional(),
        marginRightMm: Joi.number().min(0).optional(),
        marginBottomMm: Joi.number().min(0).optional(),
        marginLeftMm: Joi.number().min(0).optional()
    }).default()
});

export const updateDocumentTemplateSchema = Joi.object({
    name: Joi.string().trim().optional(),
    docType: Joi.string().valid('system', 'student', 'other').trim().optional(),
    documentFormat: Joi.string().valid('html', 'pdf', 'xlsx', 'fillable_pdf', 'docx').optional(),
    fileType: Joi.string().allow('', null).trim().optional(),
    templateContent: Joi.string().allow('', null).optional(),
    backgroundImageUrl: Joi.string().allow('', null).optional(),
    shortcodes: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().allow('', null).trim().optional(),
    customFonts: Joi.array().items(
        Joi.object({
            family: Joi.string().required().trim(),
            label: Joi.string().required().trim(),
            source: Joi.string().required()
        })
    ).optional(),
    status: Joi.string().valid('draft', 'active', 'inactive').optional(),
    isActive: Joi.boolean().optional(),
    pageSettings: Joi.object({
        preset: Joi.string().valid('A4', 'A3', 'Letter', 'Legal', 'Custom').optional(),
        orientation: Joi.string().valid('portrait', 'landscape').optional(),
        unit: Joi.string().valid('mm', 'in', 'px').optional(),
        widthMm: Joi.number().positive().optional(),
        heightMm: Joi.number().positive().optional(),
        marginTopMm: Joi.number().min(0).optional(),
        marginRightMm: Joi.number().min(0).optional(),
        marginBottomMm: Joi.number().min(0).optional(),
        marginLeftMm: Joi.number().min(0).optional()
    }).optional()
});

export const queryDocumentTemplateSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    search: Joi.string().optional(),
    docType: Joi.string().valid('system', 'student', 'other').optional(),
    documentFormat: Joi.string().valid('html', 'pdf', 'xlsx', 'fillable_pdf', 'docx').optional(),
    status: Joi.string().valid('draft', 'active', 'inactive').optional(),
    isActive: Joi.boolean().optional()
});

export const generateDocumentSchema = Joi.object({
    templateId: Joi.string().required(),
    studentId: Joi.string().allow('', null).optional(),
    outputFormat: Joi.string().valid('pdf', 'docx', 'xlsx').optional()
});
