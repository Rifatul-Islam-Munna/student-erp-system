import Joi from 'joi';

const transactionBaseSchema = {
    item: Joi.string().required().trim().max(255),
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().valid('tuition_fee', 'admission_fee', 'commission', 'salary', 'rent', 'utility', 'marketing', 'office_supply', 'other').required(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'bkash', 'nagad', 'rocket', 'card', 'other').required(),
    status: Joi.string().valid('completed', 'pending', 'cancelled').default('completed'),
    reference: Joi.string().allow('', null).trim(),
    student: Joi.string().allow(null),
    agent: Joi.string().allow(null),
    partnerAgency: Joi.string().allow(null),
    branch: Joi.string().required(),
    date: Joi.date().iso().default(Date.now)
};

export const createTransactionSchema = Joi.object(transactionBaseSchema);

export const updateTransactionSchema = Joi.object(transactionBaseSchema).fork(
    Object.keys(transactionBaseSchema),
    (schema) => schema.optional()
);

export const queryTransactionSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    type: Joi.string().optional(),
    category: Joi.string().optional(),
    paymentMethod: Joi.string().optional(),
    branch: Joi.string().optional(),
    status: Joi.string().optional(),
    student: Joi.string().optional(),
    agent: Joi.string().optional(),
    partnerAgency: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    search: Joi.string().optional()
});
