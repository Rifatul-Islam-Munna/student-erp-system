import Joi from 'joi';

export const createAccountSchema = Joi.object({
    name: Joi.string().required().trim(),
    type: Joi.string().valid('income', 'expense', 'asset', 'liability', 'equity').required(),
    code: Joi.string().allow('', null).trim(),
    description: Joi.string().allow('', null).trim(),
    isActive: Joi.boolean().default(true),
    branch: Joi.string().allow(null)
});

export const updateAccountSchema = Joi.object({
    name: Joi.string().trim(),
    type: Joi.string().valid('income', 'expense', 'asset', 'liability', 'equity'),
    code: Joi.string().allow('', null).trim(),
    description: Joi.string().allow('', null).trim(),
    isActive: Joi.boolean(),
    branch: Joi.string().allow(null)
});

export const createFinancialTransactionSchema = Joi.object({
    item: Joi.string().required().trim(),
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().required(), // Generic category or account name
    account: Joi.string().optional(), // Reference to Account model
    amount: Joi.number().min(0).required(),
    taxAmount: Joi.number().min(0).default(0),
    isTaxable: Joi.boolean().default(false),
    transactionType: Joi.string().valid('income', 'expense', 'tax_payment', 'transfer').default('income'),
    paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'bkash', 'nagad', 'rocket', 'card', 'other').required(),
    status: Joi.string().valid('completed', 'pending', 'cancelled').default('completed'),
    reference: Joi.string().allow('', null).trim(),
    student: Joi.string().allow(null),
    agent: Joi.string().allow(null),
    branch: Joi.string().required(),
    date: Joi.date().iso().default(Date.now)
});

export const queryAccountSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    type: Joi.string().valid('income', 'expense', 'asset', 'liability', 'equity').optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
    branch: Joi.string().optional()
});

export const queryReportSchema = Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    branch: Joi.string().optional()
});
