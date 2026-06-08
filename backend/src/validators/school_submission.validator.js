import Joi from 'joi';

export const schoolSubmissionBaseSchema = {
    student: Joi.string().required(),
    school: Joi.string().required(),
    intake: Joi.string().required().trim(),
    status: Joi.string().valid('Pending', 'Submitted', 'Interview Scheduled', 'COE Approved', 'Visa Approved', 'Rejected').default('Pending'),
    appliedDate: Joi.date().iso().default(Date.now),
    notes: Joi.string().allow('', null).trim(),
    internalRemarks: Joi.string().allow('', null).trim()
};

export const createSchoolSubmissionSchema = Joi.object(schoolSubmissionBaseSchema);

export const updateSchoolSubmissionSchema = Joi.object(schoolSubmissionBaseSchema).fork(
    Object.keys(schoolSubmissionBaseSchema),
    (schema) => schema.optional()
);

export const querySchoolSubmissionSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    student: Joi.string().optional(),
    school: Joi.string().optional(),
    status: Joi.string().optional(),
    intake: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});
