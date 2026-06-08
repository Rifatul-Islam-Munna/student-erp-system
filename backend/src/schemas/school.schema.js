export const intakeResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        month: { type: 'string' },
        deadline: { type: 'string', format: 'date-time' },
        minJlptLevel: { type: 'string' },
        minEducation: { type: 'string' },
        minGpaSsc: { type: 'number' },
        minGpaHsc: { type: 'number' },
        minAge: { type: 'number' },
        maxAge: { type: 'number' }
    }
};

export const schoolResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        nameEn: { type: 'string' },
        nameJp: { type: 'string' },
        city: { type: 'string' },
        country: { type: 'string' },
        website: { type: 'string' },
        driveLink: { type: 'string' },
        contactPerson: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        shokaiFee: { type: 'number' },
        tuitionYear1: { type: 'number' },
        tuitionYear2: { type: 'number' },
        admissionFee: { type: 'number' },
        interviewType: { type: 'string' },
        region: { type: 'string' },
        immigrationBureau: { type: 'array', items: { type: 'string' } },
        hasDormitory: { type: 'boolean' },
        intakeMonths: { type: 'array', items: { type: 'string' } },
        intakes: { type: 'array', items: intakeResponseSchema },
        notes: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllSchoolsSwagger = {
    tags: ['Schools'],
    description: 'Get all schools with filters and pagination',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            search: { type: 'string' },
            country: { type: 'string' },
            region: { type: 'string' },
            city: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: schoolResponseSchema },
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

export const createSchoolSwagger = {
    tags: ['Schools'],
    description: 'Create a new school',
    security: [{ bearerAuth: [] }],
    body: schoolResponseSchema,
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: schoolResponseSchema
            }
        }
    }
};
