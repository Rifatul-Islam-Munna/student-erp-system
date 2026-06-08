import Joi from 'joi';

export const createWorkflowRuleSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(200),
    description: Joi.string().allow('', null).trim(),
    triggerEvent: Joi.string().valid('visitor_created', 'visitor_updated', 'student_created', 'student_updated', 'submission_status_changed', 'coe_approved', 'visa_approved', 'payment_received', 'invoice_created', 'invoice_overdue', 'task_created', 'task_deadline_passed', 'batch_enrollment', 'visa_status_changed').required(),
    conditions: Joi.array().items(Joi.object({
        field: Joi.string().required().trim(),
        operator: Joi.string().valid('equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in').required(),
        value: Joi.any().required()
    })),
    actions: Joi.array().items(Joi.object({
        type: Joi.string().valid('send_notification', 'send_email', 'send_sms', 'assign_user', 'update_field', 'create_task', 'log_communication').required(),
        config: Joi.object().default({})
    })).min(1).required(),
    assignmentStrategy: Joi.string().valid('round_robin', 'least_loaded', 'manual', '').default(''),
    isActive: Joi.boolean().default(true),
    branch: Joi.string().allow(null)
});

export const updateWorkflowRuleSchema = Joi.object({
    name: Joi.string().trim().min(2).max(200),
    description: Joi.string().allow('', null).trim(),
    triggerEvent: Joi.string().valid('visitor_created', 'visitor_updated', 'student_created', 'student_updated', 'submission_status_changed', 'coe_approved', 'visa_approved', 'payment_received', 'invoice_created', 'invoice_overdue', 'task_created', 'task_deadline_passed', 'batch_enrollment', 'visa_status_changed'),
    conditions: Joi.array().items(Joi.object({
        field: Joi.string().required().trim(),
        operator: Joi.string().valid('equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in').required(),
        value: Joi.any().required()
    })),
    actions: Joi.array().items(Joi.object({
        type: Joi.string().valid('send_notification', 'send_email', 'send_sms', 'assign_user', 'update_field', 'create_task', 'log_communication').required(),
        config: Joi.object().default({})
    })),
    assignmentStrategy: Joi.string().valid('round_robin', 'least_loaded', 'manual', ''),
    isActive: Joi.boolean(),
    branch: Joi.string().allow(null)
});

export const queryWorkflowRuleSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(500).default(10),
    search: Joi.string().optional(),
    triggerEvent: Joi.string().optional(),
    isActive: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
    branch: Joi.string().optional()
});
