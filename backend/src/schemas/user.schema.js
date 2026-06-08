export const userResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        role: { type: 'string' },
        avatar: { type: 'string' },
        accountStatus: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
        branch: { type: ['string', 'object'] },
        address: { type: 'string' },
        commissionType: { type: 'string' },
        commissionAmount: { type: 'number' },
        totalEarnings: { type: 'number' },
        lastLoginAt: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllUsersSwagger = {
    tags: ['Users'],
    description: 'Get all users with filters and pagination',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            search: { type: 'string' },
            role: { type: 'string' },
            accountStatus: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: userResponseSchema },
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

export const createUserSwagger = {
    tags: ['Users'],
    description: 'Create a new user (admin, counselor, agent, etc.)',
    security: [{ bearerAuth: [] }],
    body: userResponseSchema,
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: userResponseSchema
            }
        }
    }
};
