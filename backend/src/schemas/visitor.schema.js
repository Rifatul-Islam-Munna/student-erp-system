export const educationResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        examName: { type: 'string' },
        year: { type: 'string' },
        board: { type: 'string' },
        gpa: { type: 'number' },
        groupSubject: { type: 'string' }
    },
    additionalProperties: true
};

export const japaneseTestSchema = {
    type: 'object',
    properties: {
        hasCertificate: { type: 'boolean' },
        examType: { type: 'string' },
        level: { type: 'string' },
        score: { type: 'string' }
    },
    additionalProperties: true
};

export const visitorResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        fullName: { type: 'string' }, // Support both name and fullName variations
        dateOfBirth: { type: 'string', format: 'date-time' },
        phone: { type: 'string' },
        guardianPhone: { type: 'string' },
        email: { type: 'string', format: 'email' },
        address: { type: 'string' },
        gender: { type: 'string' },
        education: {
            type: 'array',
            items: educationResponseSchema
        },
        JapaneseTest: japaneseTestSchema,
        visaType: { type: 'string' },
        preferredCountry: { type: 'array', items: { type: 'string' } },
        intake: { type: 'string' },
        BudgetConcerned: { type: 'boolean' },
        branch: { 
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' }
            },
            additionalProperties: true
        },
        source: { type: 'string' },
        counselor: { type: 'string' },
        courseType: { type: 'string' },
        courseName: { type: 'string' },
        preferredDate: { type: 'string', format: 'date-time' },
        counselingNote: { type: 'string' },
        status: { type: 'string' },
        purpose: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllVisitorsSwagger = {
    tags: ['Visitors'],
    description: 'Fetch all visitors with filters and pagination',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            branch: { type: 'string' },
            search: { type: 'string' }
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
                    items: visitorResponseSchema
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

export const createVisitorSwagger = {
    tags: ['Visitors'],
    description: 'Create a new visitor',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            fullName: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            gender: { type: 'string' },
            branch: { type: 'string' },
            source: { type: 'string' },
            counselor: { type: 'string' },
            visaType: { type: 'string' },
            BudgetConcerned: { type: 'boolean' },
            JapaneseTest: japaneseTestSchema
        },
        additionalProperties: true
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: visitorResponseSchema
            }
        }
    }
};

export const getVisitorStatsSwagger = {
    tags: ['Visitors'],
    description: 'Get dashboard statistics',
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    additionalProperties: true
                }
            }
        }
    }
};
