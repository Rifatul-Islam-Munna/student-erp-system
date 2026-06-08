export const auditLogResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        action: { type: 'string' },
        changes: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    field: { type: 'string' },
                    oldValue: {},
                    newValue: {}
                }
            }
        },
        performedBy: {
            type: ['string', 'object', 'null'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
            }
        },
        performedByName: { type: 'string' },
        ipAddress: { type: 'string' },
        notes: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllAuditLogsSwagger = {
    tags: ['Audit Logs'],
    description: 'Get all audit logs with pagination, filtering by entity type, action, user, and date range',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 20 },
            search: { type: 'string' },
            entityType: { type: 'string' },
            entityId: { type: 'string' },
            action: { type: 'string', enum: ['create', 'update', 'delete'] },
            performedBy: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: auditLogResponseSchema },
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

export const getAuditLogByIdSwagger = {
    tags: ['Audit Logs'],
    description: 'Get audit log details by ID',
    security: [{ bearerAuth: [] }]
};

export const getEntityHistorySwagger = {
    tags: ['Audit Logs'],
    description: 'Get complete audit trail history for a specific entity',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            entityType: { type: 'string' },
            entityId: { type: 'string' }
        }
    }
};

export const getAuditStatsSwagger = {
    tags: ['Audit Logs'],
    description: 'Get audit log statistics grouped by action, entity type, and user',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    }
};

export const purgeAuditLogsSwagger = {
    tags: ['Audit Logs'],
    description: 'Purge (delete) audit logs older than specified date. Super admin only.',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['beforeDate'],
        properties: {
            beforeDate: { type: 'string', format: 'date-time' }
        }
    }
};

export const exportAuditLogsSwagger = {
    tags: ['Audit Logs'],
    description: 'Export audit logs to CSV file with optional filters',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            entityType: { type: 'string' },
            action: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    }
};
