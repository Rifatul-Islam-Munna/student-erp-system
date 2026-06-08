import Joi from 'joi';

const taskBaseSchema = {
    title: Joi.string().required().trim().min(3).max(255),
    description: Joi.string().allow('', null).trim(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').default('pending'),
    deadline: Joi.date().iso().allow(null),
    assignedTo: Joi.string().required()
};

export const createTaskSchema = Joi.object(taskBaseSchema);

export const updateTaskSchema = Joi.object(taskBaseSchema).fork(
    Object.keys(taskBaseSchema),
    (schema) => schema.optional()
);

export const updateTaskStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').required()
});

export const queryTaskSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string().optional(),
    priority: Joi.string().optional(),
    assignedTo: Joi.string().optional(),
    createdBy: Joi.string().optional(),
    search: Joi.string().optional()
});
