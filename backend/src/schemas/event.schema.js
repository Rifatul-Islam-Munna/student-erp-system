export const eventResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        title: { type: 'string' },
        category: { type: 'string' },
        description: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
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
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllEventsSwagger = {
    tags: ['Events & Calendar'],
    description: 'Get all calendar events with date range and branch filtering',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 50 },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            category: { type: 'string' },
            branch: { type: 'string' },
            search: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: eventResponseSchema },
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

export const createEventSwagger = {
    tags: ['Events & Calendar'],
    description: 'Create a new calendar event',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['title', 'category', 'startDate', 'endDate'],
        properties: {
            title: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
            branch: { type: 'string' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: eventResponseSchema
            }
        }
    }
};
