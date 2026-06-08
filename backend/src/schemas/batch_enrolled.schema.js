export const batchEnrolledResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        batch: { type: ['string', 'object'] },
        student: { type: ['string', 'object'] },
        enrollmentDate: { type: 'string', format: 'date-time' },
        status: { type: 'string' },
        internalNotes: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllBatchEnrolledSwagger = {
    tags: ['Batch Enrolled'],
    description: 'All Batch Enrollments',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            batch: { type: 'string' },
            student: { type: 'string' },
            status: { type: 'string' }
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
                    items: batchEnrolledResponseSchema
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

export const createBatchEnrolledSwagger = {
    tags: ['Batch Enrolled'],
    description: 'Create Batch Enrollment',
    security: [{ bearerAuth: [] }],
    body: batchEnrolledResponseSchema,
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: batchEnrolledResponseSchema
            }
        }
    }
};
