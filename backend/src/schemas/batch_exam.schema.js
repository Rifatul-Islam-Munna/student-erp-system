export const batchExamResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        batch: { type: ['string', 'object'] },
        examType: { type: 'string' },
        level: { type: 'string' },
        examDate: { type: 'string', format: 'date-time' },
        totalMarks: { type: 'number' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllBatchExamsSwagger = {
    tags: ['Batch Exams'],
    description: 'All Batch Exams',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            batch: { type: 'string' },
            examType: { type: 'string' }
        },
        additionalProperties: true
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: batchExamResponseSchema
                },
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

export const createBatchExamSwagger = {
    tags: ['Batch Exams'],
    description: 'Create Batch Exam',
    security: [{ bearerAuth: [] }],
    body: batchExamResponseSchema,
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: batchExamResponseSchema
            }
        }
    }
};
