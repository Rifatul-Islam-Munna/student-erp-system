import Joi from 'joi';

export const queryNotificationSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    type: Joi.string().valid('task_assigned', 'task_deadline', 'status_change', 'payment_received', 'submission_update', 'system', 'reminder', 'announcement').optional(),
    isRead: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});

export const sendNotificationSchema = Joi.object({
    recipients: Joi.array().items(Joi.string()).min(1).required(),
    type: Joi.string().valid('task_assigned', 'task_deadline', 'status_change', 'payment_received', 'submission_update', 'system', 'reminder', 'announcement').default('announcement'),
    title: Joi.string().required().trim().max(200),
    body: Joi.string().required().trim().max(1000),
    link: Joi.string().allow('', null).trim(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
});

export const broadcastNotificationSchema = Joi.object({
    roles: Joi.array().items(Joi.string()).optional(),
    type: Joi.string().valid('task_assigned', 'task_deadline', 'status_change', 'payment_received', 'submission_update', 'system', 'reminder', 'announcement').default('announcement'),
    title: Joi.string().required().trim().max(200),
    body: Joi.string().required().trim().max(1000),
    link: Joi.string().allow('', null).trim(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
});

export const updatePreferencesSchema = Joi.object({
    enabledTypes: Joi.object({
        task_assigned: Joi.boolean(),
        task_deadline: Joi.boolean(),
        status_change: Joi.boolean(),
        payment_received: Joi.boolean(),
        submission_update: Joi.boolean(),
        system: Joi.boolean(),
        reminder: Joi.boolean(),
        announcement: Joi.boolean()
    }).optional(),
    emailDigest: Joi.string().valid('none', 'daily', 'weekly').optional(),
    playSound: Joi.boolean().optional(),
    pushEnabled: Joi.boolean().optional()
});
