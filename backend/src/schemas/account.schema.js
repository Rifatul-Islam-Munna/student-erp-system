const accountResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string' },
        code: { type: 'string' },
        description: { type: 'string' },
        isActive: { type: 'boolean' },
        branch: { type: ['string', 'object'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllAccountsSwagger = {
    tags: ['Accounts'],
    description: 'Get all account heads',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            type: { type: 'string', enum: ['income', 'expense', 'asset', 'liability', 'equity'] },
            isActive: { type: 'boolean' },
            search: { type: 'string' },
            branch: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: accountResponseSchema },
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

export const getProfitLossSwagger = {
    tags: ['Accounts'],
    description: 'Get Profit & Loss report',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            branch: { type: 'string' }
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
                        netProfit: { type: 'number' },
                        incomeByCategory: { type: 'array', items: { type: 'object' } },
                        expenseByCategory: { type: 'array', items: { type: 'object' } }
                    }
                }
            }
        }
    }
};

export const getTaxReportSwagger = {
    tags: ['Accounts'],
    description: 'Get Tax report',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            branch: { type: 'string' }
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
                        totalTaxCollected: { type: 'number' },
                        totalTaxPaid: { type: 'number' },
                        netTax: { type: 'number' }
                    }
                }
            }
        }
    }
};
