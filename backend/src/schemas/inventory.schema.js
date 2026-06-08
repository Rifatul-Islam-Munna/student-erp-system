export const inventoryItemResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        sku: { type: 'string' },
        category: { type: 'string' },
        quantity: { type: 'number' },
        unit: { type: 'string' },
        minThreshold: { type: 'number' },
        price: { type: 'number' },
        branch: {
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' }
            }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const inventoryLogResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        item: { type: ['string', 'object'] },
        type: { type: 'string' },
        quantity: { type: 'number' },
        targetStudent: { type: ['string', 'object', 'null'] },
        targetUser: { type: ['string', 'object', 'null'] },
        recordedBy: { type: ['string', 'object'] },
        note: { type: 'string' },
        dateTime: { type: 'string', format: 'date-time' }
    }
};

export const getAllItemsSwagger = {
    tags: ['Inventory'],
    description: 'Get all inventory items with filtering and pagination',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            category: { type: 'string' },
            branch: { type: 'string' },
            lowStock: { type: 'boolean' },
            search: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: inventoryItemResponseSchema },
                pagination: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        pages: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' }
                    }
                }
            }
        }
    }
};

export const createItemSwagger = {
    tags: ['Inventory'],
    description: 'Create a new inventory item',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['name', 'sku', 'category', 'branch'],
        properties: {
            name: { type: 'string' },
            sku: { type: 'string' },
            category: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            minThreshold: { type: 'number' },
            price: { type: 'number' },
            branch: { type: 'string' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: inventoryItemResponseSchema
            }
        }
    }
};

export const updateStockSwagger = {
    tags: ['Inventory'],
    description: 'Update stock level with logging',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: { id: { type: 'string' } }
    },
    body: {
        type: 'object',
        required: ['type', 'quantity'],
        properties: {
            type: { type: 'string', enum: ['purchase', 'distribution', 'adjustment', 'loss', 'return'] },
            quantity: { type: 'number' },
            targetStudent: { type: 'string' },
            targetUser: { type: 'string' },
            note: { type: 'string' },
            dateTime: { type: 'string', format: 'date-time' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                currentQuantity: { type: 'number' }
            }
        }
    }
};
