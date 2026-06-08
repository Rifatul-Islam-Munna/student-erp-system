export const partnerAgencySchemaSwagger = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        agencyName: { type: 'string' },
        ownerName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        address: { type: 'string' },
        website: { type: 'string' },
        type: { type: 'string', enum: ['agent', 'sub-agent', 'corporate', 'other'] },
        commissionRate: { type: 'number' },
        isActive: { type: 'boolean' },
        branch: { 
            type: 'object',
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' }
            }
        },
        notes: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllPartnerAgenciesSwagger = {
    description: 'Get all partner agencies with filters and pagination',
    tags: ['Partner Agency'],
    security: [{ bearerAuth: [] }],
    query: {
        type: 'object',
        properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
            search: { type: 'string' },
            type: { type: 'string', enum: ['agent', 'sub-agent', 'corporate', 'other'] },
            isActive: { type: 'boolean' },
            branch: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: partnerAgencySchemaSwagger
                },
                pagination: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer' },
                        pages: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' }
                    }
                }
            }
        }
    }
};

export const createPartnerAgencySwagger = {
    description: 'Create a new partner agency',
    tags: ['Partner Agency'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['agencyName', 'ownerName', 'email', 'phone'],
        properties: {
            agencyName: { type: 'string' },
            ownerName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            website: { type: 'string' },
            type: { type: 'string', enum: ['agent', 'sub-agent', 'corporate', 'other'] },
            commissionRate: { type: 'number' },
            isActive: { type: 'boolean' },
            branch: { type: 'string' },
            notes: { type: 'string' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: partnerAgencySchemaSwagger
            }
        }
    }
};
