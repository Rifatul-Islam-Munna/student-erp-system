export const commLogResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        type: { type: 'string' },
        direction: { type: 'string' },
        status: { type: 'string' },
        summary: { type: 'string' },
        details: { type: 'string' },
        duration: { type: 'number' },
        student: {
            type: ['string', 'object', 'null'],
            properties: {
                _id: { type: 'string' },
                fullNameEn: { type: 'string' },
                phone: { type: 'string' }
            }
        },
        visitor: {
            type: ['string', 'object', 'null'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                phone: { type: 'string' }
            }
        },
        assignedUser: {
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                role: { type: 'string' }
            }
        },
        recordedBy: {
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' }
            }
        },
        dateTime: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllCommLogsSwagger = {
    tags: ['Communication Logs'],
    description: 'Get all communication logs with filtering and pagination',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            type: { type: 'string' },
            status: { type: 'string' },
            direction: { type: 'string' },
            student: { type: 'string' },
            visitor: { type: 'string' },
            assignedUser: { type: 'string' },
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
                data: { type: 'array', items: commLogResponseSchema },
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

export const createCommLogSwagger = {
    tags: ['Communication Logs'],
    description: 'Create a new communication log',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['type', 'direction', 'status', 'summary', 'assignedUser'],
        properties: {
            type: { type: 'string' },
            direction: { type: 'string' },
            status: { type: 'string' },
            summary: { type: 'string' },
            details: { type: 'string' },
            duration: { type: 'number' },
            student: { type: 'string' },
            visitor: { type: 'string' },
            assignedUser: { type: 'string' },
            dateTime: { type: 'string', format: 'date-time' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: commLogResponseSchema
            }
        }
    }
};
