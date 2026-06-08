import Joi from 'joi';

export const batchExamResultBaseSchema = {
    batchExam: Joi.string().required(),
    student: Joi.string().required(),
    score: Joi.string().required().trim(),
    result: Joi.string().valid('Pass', 'Fail', 'Pending', '').required(),
    remarks: Joi.string().allow('', null).trim()
};

export const createBatchExamResultSchema = Joi.object(batchExamResultBaseSchema);

export const updateBatchExamResultSchema = Joi.object(batchExamResultBaseSchema).fork(
    Object.keys(batchExamResultBaseSchema),
    (schema) => schema.optional()
);

export const queryBatchExamResultSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    batchExam: Joi.string().optional(),
    student: Joi.string().optional()
});
