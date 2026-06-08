import Joi from 'joi';

const inventoryItemBaseSchema = {
    name: Joi.string().required().trim().min(2).max(100),
    sku: Joi.string().required().trim().uppercase(),
    category: Joi.string().required().trim(),
    quantity: Joi.number().min(0).default(0),
    unit: Joi.string().default('pcs').trim(),
    minThreshold: Joi.number().min(0).default(5),
    price: Joi.number().min(0).default(0),
    branch: Joi.string().required()
};

export const createInventoryItemSchema = Joi.object(inventoryItemBaseSchema);

export const updateInventoryItemSchema = Joi.object(inventoryItemBaseSchema).fork(
    Object.keys(inventoryItemBaseSchema),
    (schema) => schema.optional()
);

export const updateStockSchema = Joi.object({
    type: Joi.string().valid('purchase', 'distribution', 'adjustment', 'loss', 'return').required(),
    quantity: Joi.number().not(0).required(),
    targetStudent: Joi.string().allow(null),
    targetUser: Joi.string().allow(null),
    note: Joi.string().allow('', null).trim(),
    dateTime: Joi.date().iso().default(Date.now)
});

export const queryInventorySchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    category: Joi.string().optional(),
    branch: Joi.string().optional(),
    lowStock: Joi.boolean().optional(),
    search: Joi.string().optional()
});
