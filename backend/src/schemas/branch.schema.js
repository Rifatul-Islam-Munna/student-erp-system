export const branchResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        address: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getBranchesSwagger = {
    tags: ['Branches'],
    description: 'Fetch all branches with optional filters',
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: branchResponseSchema
                }
            }
        }
    }
};

export const createBranchSwagger = {
    tags: ['Branches'],
    description: 'Create a new branch',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: branchResponseSchema
            }
        }
    }
};

export const updateBranchSwagger = {
    tags: ['Branches'],
    description: 'Update an existing branch',
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
            name: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: branchResponseSchema
            }
        }
    }
};

export const deleteBranchSwagger = {
    tags: ['Branches'],
    description: 'Delete a branch',
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
