export const transactionResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        item: { type: 'string' },
        type: { type: 'string', enum: ['income', 'expense'] },
        category: { type: 'string' },
        amount: { type: 'number' },
        paymentMethod: { type: 'string' },
        status: { type: 'string' },
        reference: { type: 'string' },
        student: {
            type: ['string', 'object', 'null'],
            properties: {
                _id: { type: 'string' },
                fullNameEn: { type: 'string' }
            }
        },
        agent: {
            type: ['string', 'object', 'null'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' }
            }
        },
        branch: {
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' }
            }
        },
        recordedBy: {
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' }
            }
        },
        date: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllTransactionsSwagger = {
    tags: ['Accounts'],
    description: 'Get all transactions with filtering and pagination',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            type: { type: 'string' },
            category: { type: 'string' },
            paymentMethod: { type: 'string' },
            branch: { type: 'string' },
            status: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            search: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: transactionResponseSchema },
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

export const getTransactionStatsSwagger = {
    tags: ['Accounts'],
    description: 'Get financial summary statistics',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            branch: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        totalIncome: { type: 'number' },
                        totalExpense: { type: 'number' },
                        netBalance: { type: 'number' },
                        count: { type: 'number' }
                    }
                }
            }
        }
    }
};

export const createTransactionSwagger = {
    tags: ['Accounts'],
    description: 'Create a new transaction',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['item', 'type', 'category', 'amount', 'paymentMethod', 'branch'],
        properties: {
            item: { type: 'string' },
            type: { type: 'string' },
            category: { type: 'string' },
            amount: { type: 'number' },
            paymentMethod: { type: 'string' },
            status: { type: 'string' },
            reference: { type: 'string' },
            student: { type: 'string' },
            agent: { type: 'string' },
            branch: { type: 'string' },
            date: { type: 'string', format: 'date-time' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: transactionResponseSchema
            }
        }
    }
};
