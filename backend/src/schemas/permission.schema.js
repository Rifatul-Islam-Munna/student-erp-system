export const permissionResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        module: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getPermissionsSwagger = {
    tags: ['Permissions'],
    description: 'Fetch all permissions mapped by grouped modules',
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: permissionResponseSchema
                }
            }
        }
    }
};

export const createPermissionSwagger = {
    tags: ['Permissions'],
    description: 'Create a new permission assignment component',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['name', 'module'],
        properties: {
            name: { type: 'string', description: 'Internal programmatic name (lowercase, underscores allowed)' },
            description: { type: 'string', description: 'Verbose description of logic action' },
            module: { type: 'string', description: 'Grouping domain name (camelCase or sentence)' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: permissionResponseSchema
            }
        }
    }
};

export const updatePermissionSwagger = {
    tags: ['Permissions'],
    description: 'Update existing permission setup detail',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Permission ID' }
        }
    },
    body: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Updated unique identifier' },
            description: { type: 'string', description: 'Updated verbose description' },
            module: { type: 'string', description: 'Updated group label' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: permissionResponseSchema
            }
        }
    }
};

export const deletePermissionSwagger = {
    tags: ['Permissions'],
    description: 'Remove a permission from registry completely',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Permission ID' }
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
