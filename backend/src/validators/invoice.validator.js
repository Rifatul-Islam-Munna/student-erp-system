import Joi from 'joi';

export const createInvoiceSchema = Joi.object({
    student: Joi.string().allow(null),
    partnerAgency: Joi.string().allow(null),
    recipientName: Joi.string().required().trim(),
    recipientEmail: Joi.string().email().allow('', null).trim(),
    recipientPhone: Joi.string().allow('', null).trim(),
    recipientAddress: Joi.string().allow('', null).trim(),
    items: Joi.array().items(Joi.object({
        description: Joi.string().required().trim(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).required()
    })).min(1).required(),
    taxRate: Joi.number().min(0).max(100).default(0),
    discount: Joi.number().min(0).default(0),
    dueDate: Joi.date().iso().required(),
    notes: Joi.string().allow('', null).trim(),
    branch: Joi.string().allow(null),
    paidAmount: Joi.number().min(0).default(0),
    status: Joi.string().valid('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled').default('draft')
});

export const updateInvoiceSchema = Joi.object({
    recipientName: Joi.string().trim(),
    recipientEmail: Joi.string().email().allow('', null).trim(),
    recipientPhone: Joi.string().allow('', null).trim(),
    recipientAddress: Joi.string().allow('', null).trim(),
    items: Joi.array().items(Joi.object({
        description: Joi.string().required().trim(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).required()
    })).min(1),
    taxRate: Joi.number().min(0).max(100),
    discount: Joi.number().min(0),
    dueDate: Joi.date().iso(),
    notes: Joi.string().allow('', null).trim(),
    paidAmount: Joi.number().min(0),
    status: Joi.string().valid('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')
});

export const recordPaymentSchema = Joi.object({
    amount: Joi.number().min(0.01).required(),
    paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'bkash', 'nagad', 'rocket', 'card', 'other').default('cash'),
    reference: Joi.string().allow('', null).trim()
});

export const queryInvoiceSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(500).default(10),
    search: Joi.string().optional(),
    status: Joi.string().optional(),
    student: Joi.string().optional(),
    branch: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});
