import Joi from 'joi';

export const createMessageSchema = Joi.object({
    messageType: Joi.string().valid('email', 'sms').required(),
    recipientEmail: Joi.string().email().allow(null, ''),
    recipientPhone: Joi.string().allow(null, ''),
    subject: Joi.string().allow(null, ''),
    content: Joi.string().required(),
    status: Joi.string().valid('pending', 'sent', 'failed', 'draft').default('pending')
}).custom((value, helpers) => {
    if (value.messageType === 'email' && !value.recipientEmail) {
        return helpers.message('recipientEmail is required when messageType is email');
    }
    if (value.messageType === 'sms' && !value.recipientPhone) {
        return helpers.message('recipientPhone is required when messageType is sms');
    }
    if (value.messageType === 'email' && !value.subject) {
        return helpers.message('subject is required when messageType is email');
    }
    return value;
});

export const updateMessageSchema = Joi.object({
    subject: Joi.string().allow(null, ''),
    content: Joi.string(),
    status: Joi.string().valid('pending', 'sent', 'failed', 'draft')
});

export const queryMessageSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    messageType: Joi.string().valid('email', 'sms'),
    status: Joi.string().valid('pending', 'sent', 'failed', 'draft'),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    keyword: Joi.string().allow('')
});

export const messageSettingSchema = Joi.object({
    rolePermissions: Joi.object({
        super_admin: Joi.object({
            emailEnabled: Joi.boolean(),
            smsEnabled: Joi.boolean()
        }),
        admin: Joi.object({
            emailEnabled: Joi.boolean(),
            smsEnabled: Joi.boolean()
        }),
        branch: Joi.object({
            emailEnabled: Joi.boolean(),
            smsEnabled: Joi.boolean()
        })
    }),
    emailGateways: Joi.array().items(Joi.object({
        _id: Joi.string(),
        provider: Joi.string().required(),
        host: Joi.string().required(),
        port: Joi.number().required(),
        user: Joi.string().required(),
        pass: Joi.string().required(),
        fromEmail: Joi.string().email().required(),
        isDefault: Joi.boolean().default(false)
    })),
    smsGateways: Joi.array().items(Joi.object({
        _id: Joi.string(),
        provider: Joi.string().required(),
        apiKey: Joi.string().required(),
        apiSecret: Joi.string().allow('', null),
        senderId: Joi.string().required(),
        isDefault: Joi.boolean().default(false)
    }))
});
