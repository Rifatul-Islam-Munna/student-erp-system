import Joi from 'joi';

const commLogBaseSchema = {
    type: Joi.string().valid('call', 'email', 'sms', 'whatsapp', 'facebook', 'instagram', 'other').required(),
    direction: Joi.string().valid('inbound', 'outbound').required(),
    status: Joi.string().valid('connected', 'missed', 'busy', 'failed', 'sent', 'received', 'pending').required(),
    summary: Joi.string().required().trim().max(255),
    details: Joi.string().allow('', null).trim(),
    duration: Joi.number().min(0).default(0),
    student: Joi.string().allow(null),
    visitor: Joi.string().allow(null),
    assignedUser: Joi.string().required(),
    dateTime: Joi.date().iso().default(Date.now)
};

export const createCommLogSchema = Joi.object(commLogBaseSchema).custom((value, helpers) => {
    if (!value.student && !value.visitor) {
        return helpers.error('any.custom', { message: 'Either a student or a visitor must be linked to the log.' });
    }
    return value;
});

export const updateCommLogSchema = Joi.object(commLogBaseSchema).fork(
    Object.keys(commLogBaseSchema),
    (schema) => schema.optional()
);

export const queryCommLogSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    type: Joi.string().optional(),
    status: Joi.string().optional(),
    direction: Joi.string().optional(),
    student: Joi.string().optional(),
    visitor: Joi.string().optional(),
    assignedUser: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    search: Joi.string().optional()
});
