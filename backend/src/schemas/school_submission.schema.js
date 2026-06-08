export const schoolSubmissionResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        student: { type: ['string', 'object'] },
        school: { type: ['string', 'object'] },
        intake: { type: 'string' },
        status: { type: 'string' },
        appliedDate: { type: 'string', format: 'date-time' },
        notes: { type: 'string' },
        internalRemarks: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllSchoolSubmissionsSwagger = {
    tags: ['School Submissions'],
    description: 'Get all student school applications with filters',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            student: { type: 'string' },
            school: { type: 'string' },
            status: { type: 'string' },
            intake: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: schoolSubmissionResponseSchema },
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

export const createSchoolSubmissionSwagger = {
    tags: ['School Submissions'],
    description: 'Create a new school application for a student',
    security: [{ bearerAuth: [] }],
    body: schoolSubmissionResponseSchema,
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: schoolSubmissionResponseSchema
            }
        }
    }
};
