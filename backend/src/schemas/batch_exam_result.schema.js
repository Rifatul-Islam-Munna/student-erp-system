export const batchExamResultResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        batchExam: { type: ['string', 'object'] },
        student: { type: ['string', 'object'] },
        score: { type: 'string' },
        result: { type: 'string' },
        remarks: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllBatchExamResultsSwagger = {
    tags: ['Batch Exam Results'],
    description: 'All Batch Exam Results',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            batchExam: { type: 'string' },
            student: { type: 'string' }
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
                    items: batchExamResultResponseSchema
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

export const createBatchExamResultSwagger = {
    tags: ['Batch Exam Results'],
    description: 'Create Batch Exam Result',
    security: [{ bearerAuth: [] }],
    body: batchExamResultResponseSchema,
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: batchExamResultResponseSchema
            }
        }
    }
};
