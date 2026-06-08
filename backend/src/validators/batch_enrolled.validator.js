import Joi from 'joi';

export const batchEnrolledBaseSchema = {
    batch: Joi.string().required(),
    student: Joi.string().required(),
    enrollmentDate: Joi.date().iso().allow(null, ''),
    status: Joi.string().valid('active', 'completed', 'dropped', 'transferred').allow(null, ''),
    internalNotes: Joi.string().allow(null, '')
};

export const createBatchEnrolledSchema = Joi.object(batchEnrolledBaseSchema);

export const updateBatchEnrolledSchema = Joi.object(batchEnrolledBaseSchema).fork(
    Object.keys(batchEnrolledBaseSchema),
    (schema) => schema.optional()
);

export const queryBatchEnrolledSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    batch: Joi.string().optional(),
    student: Joi.string().optional(),
    status: Joi.string().optional()
});
