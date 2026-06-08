import Joi from 'joi';

const intakeObj = Joi.object({
    month: Joi.string().required(),
    deadline: Joi.date().iso().allow(null, ''),
    minJlptLevel: Joi.string().allow(null, '').trim(),
    minEducation: Joi.string().allow(null, '').trim(),
    minGpaSsc: Joi.number().precision(2).allow(null),
    minGpaHsc: Joi.number().precision(2).allow(null),
    minAge: Joi.number().integer().allow(null),
    maxAge: Joi.number().integer().allow(null)
});

export const schoolBaseSchema = {
    nameEn: Joi.string().required().trim(),
    nameJp: Joi.string().allow(null, '').trim(),
    city: Joi.string().allow(null, '').trim(),
    country: Joi.string().allow(null, '').trim(),
    website: Joi.string().uri().allow(null, '').trim(),
    driveLink: Joi.string().uri().allow(null, '').trim(),
    contactPerson: Joi.string().allow(null, '').trim(),
    email: Joi.string().email().allow(null, '').lowercase().trim(),
    phone: Joi.string().allow(null, '').trim(),
    shokaiFee: Joi.number().default(0),
    tuitionYear1: Joi.number().default(0),
    tuitionYear2: Joi.number().default(0),
    admissionFee: Joi.number().default(0),
    interviewType: Joi.string().allow(null, '').trim(),
    region: Joi.string().allow(null, '').trim(),
    immigrationBureau: Joi.array().items(Joi.string()).default([]),
    hasDormitory: Joi.boolean().default(false),
    intakeMonths: Joi.array().items(Joi.string()).default([]),
    intakes: Joi.array().items(intakeObj).default([]),
    notes: Joi.string().allow(null, '').trim()
};

export const createSchoolSchema = Joi.object(schoolBaseSchema);

export const updateSchoolSchema = Joi.object(schoolBaseSchema).fork(
    Object.keys(schoolBaseSchema),
    (schema) => schema.optional()
);

export const querySchoolSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    search: Joi.string().optional(),
    country: Joi.string().optional(),
    region: Joi.string().optional(),
    city: Joi.string().optional()
});
