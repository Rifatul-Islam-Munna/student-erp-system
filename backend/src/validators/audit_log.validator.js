import Joi from 'joi';

export const queryAuditLogSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(500).default(20),
    search: Joi.string().optional(),
    entityType: Joi.string().optional(),
    entityId: Joi.string().optional(),
    action: Joi.string().valid('create', 'update', 'delete').optional(),
    performedBy: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});

export const purgeAuditLogSchema = Joi.object({
    beforeDate: Joi.date().iso().required()
});
