export const batchResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        batchName: { type: 'string' },
        country: { type: 'string' },
        level: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        maxStudents: { type: 'number' },
        teacher: { type: 'string' },
        branch: { type: 'string' },
        classDays: { type: 'array', items: { type: 'string', enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] } },
        classTime: { type: 'string' },
        classDuration: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllBatchesSwagger = {
    tags: ['Batches'],
    description: 'Get all batches with pagination and filtering',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            search: { type: 'string' },
            branch: { type: 'string' },
            country: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: batchResponseSchema
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

export const getBatchStatsSwagger = {
    tags: ['Batches'],
    description: 'Get statistics about batches',
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        newThisMonth: { type: 'number' },
                        branchDistribution: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: { type: 'string', nullable: true },
                                    count: { type: 'number' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const createBatchSwagger = {
    tags: ['Batches'],
    description: 'Create a new batch',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['batchName'],
        properties: {
            batchName: { type: 'string' },
            country: { type: 'string' },
            level: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            maxStudents: { type: 'number' },
            teacher: { type: 'string' },
            branch: { type: 'string' },
            classDays: { type: 'array', items: { type: 'string', enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] } },
            classTime: { type: 'string' },
            classDuration: { type: 'number' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: batchResponseSchema
            }
        }
    }
};

export const updateBatchSwagger = {
    tags: ['Batches'],
    description: 'Update a batch by ID',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        properties: {
            batchName: { type: 'string' },
            country: { type: 'string' },
            level: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            maxStudents: { type: 'number' },
            teacher: { type: 'string' },
            branch: { type: 'string' },
            classDays: { type: 'array', items: { type: 'string', enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] } },
            classTime: { type: 'string' },
            classDuration: { type: 'number' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: batchResponseSchema
            }
        }
    }
};

export const deleteBatchSwagger = {
    tags: ['Batches'],
    description: 'Delete a batch by ID',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};
