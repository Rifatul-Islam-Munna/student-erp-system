import Joi from 'joi';

const educationObject = Joi.object({
    examName: Joi.string().required(),
    year: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    board: Joi.string().required(),
    gpa: Joi.number().multiple(0.01).required(),
    groupSubject: Joi.string().required()
});

const japaneseTestObject = Joi.object({
    hasCertificate: Joi.boolean().default(false),
    examType: Joi.string().optional().allow(null, ''),
    level: Joi.string().optional().allow(null, ''),
    score: Joi.string().optional().allow(null, '')
});

export const visitorBaseSchema = {
    fullName: Joi.string().required(),
    dateOfBirth: Joi.date().iso().required(),
    phone: Joi.string().required(),
    guardianPhone: Joi.string().optional().allow(null, ''),
    email: Joi.string().email().required(),
    address: Joi.string().optional().allow(null, ''),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    
    education: Joi.array().items(educationObject).optional().default([]),

    JapaneseTest: japaneseTestObject.optional().default({ hasCertificate: false }),
    
    visaType: Joi.string().optional().allow(null, ''),

    preferredCountry: Joi.array().items(Joi.string()).optional().default([]),
    intake: Joi.string().optional().allow(null, ''),
    BudgetConcerned: Joi.boolean().optional().default(false),

    branch: Joi.string().optional().allow(null, ''), // ObjectId as string
    partnerAgency: Joi.string().optional().allow(null, ''),
    source: Joi.string().optional().allow(null, ''),
    counselor: Joi.string().optional().allow(null, ''),
    
    courseType: Joi.string().optional().allow(null, ''),
    courseName: Joi.string().optional().allow(null, ''),
    preferredDate: Joi.date().iso().optional().allow(null, ''),
    counselingNote: Joi.string().optional().allow(null, ''),
    status: Joi.string().valid('new', 'contacted', 'converted', 'junk').optional().default('new'),
    purpose: Joi.string().optional().allow(null, '')
};

export const createVisitorSchema = Joi.object(visitorBaseSchema);

export const updateVisitorSchema = Joi.object(visitorBaseSchema).fork(
    Object.keys(visitorBaseSchema),
    (schema) => schema.optional()
);

export const queryVisitorSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    branch: Joi.string().optional(),
    partnerAgency: Joi.string().optional(),
    search: Joi.string().optional()
});
