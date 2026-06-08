export const taskResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
        deadline: { type: 'string', format: 'date-time' },
        assignedTo: {
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                role: { type: 'string' }
            }
        },
        createdBy: {
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' }
            }
        },
        completedAt: { type: ['string', 'null'], format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllTasksSwagger = {
    tags: ['Tasks'],
    description: 'Get all tasks with filtering and pagination',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            status: { type: 'string' },
            priority: { type: 'string' },
            assignedTo: { type: 'string' },
            search: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: taskResponseSchema },
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

export const createTaskSwagger = {
    tags: ['Tasks'],
    description: 'Create a new task',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['title', 'assignedTo'],
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string' },
            deadline: { type: 'string', format: 'date-time' },
            assignedTo: { type: 'string' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: taskResponseSchema
            }
        }
    }
};

export const updateTaskSwagger = {
    tags: ['Tasks'],
    description: 'Update task details',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: { id: { type: 'string' } }
    },
    body: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string' },
            status: { type: 'string' },
            deadline: { type: 'string', format: 'date-time' },
            assignedTo: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: taskResponseSchema
            }
        }
    }
};
