export const faqResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        question: { type: 'string' },
        answer: { type: 'string' },
        category: { type: 'string' },
        branch: {
            type: ['string', 'object', 'null'],
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
        isActive: { type: 'boolean' },
        priority: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllFAQsSwagger = {
    tags: ['FAQs'],
    description: 'Get all FAQs with branch and search filtering',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 50 },
            category: { type: 'string' },
            branch: { type: 'string' },
            search: { type: 'string' },
            isActive: { type: 'boolean' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: faqResponseSchema },
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

export const createFAQSwagger = {
    tags: ['FAQs'],
    description: 'Create a new FAQ',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['question', 'answer'],
        properties: {
            question: { type: 'string' },
            answer: { type: 'string' },
            category: { type: 'string' },
            branch: { type: 'string' },
            isActive: { type: 'boolean', default: true },
            priority: { type: 'number', default: 0 }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: faqResponseSchema
            }
        }
    }
};
