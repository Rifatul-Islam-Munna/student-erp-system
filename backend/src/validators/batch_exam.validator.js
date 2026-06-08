import Joi from 'joi';

export const batchExamBaseSchema = {
    batch: Joi.string().required(),
    examType: Joi.string().required().trim(),
    level: Joi.string().allow('', null).trim(),
    examDate: Joi.date().iso().required(),
    totalMarks: Joi.number().allow(null),
    description: Joi.string().allow('', null).trim()
};

export const createBatchExamSchema = Joi.object(batchExamBaseSchema);

export const updateBatchExamSchema = Joi.object(batchExamBaseSchema).fork(
    Object.keys(batchExamBaseSchema),
    (schema) => schema.optional()
);

export const queryBatchExamSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    batch: Joi.string().optional(),
    examType: Joi.string().optional()
});
