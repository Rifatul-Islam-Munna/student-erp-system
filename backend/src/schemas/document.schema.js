export const documentTemplateResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        docType: { type: 'string' },
        fileType: { type: 'string' },
        originalFilePath: { type: 'string' },
        originalFileName: { type: 'string' },
        templateContent: { type: 'string' },
        shortcodes: { type: 'array', items: { type: 'string' } },
        description: { type: 'string' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllDocumentTemplatesSwagger = {
    tags: ['Documents'],
    description: 'Get all document templates with filters',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            search: { type: 'string' },
            docType: { type: 'string' },
            isActive: { type: 'boolean' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: documentTemplateResponseSchema },
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

export const createDocumentTemplateSwagger = {
    tags: ['Documents'],
    description: 'Create a new document template',
    security: [{ bearerAuth: [] }],
    body: documentTemplateResponseSchema,
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: documentTemplateResponseSchema
            }
        }
    }
};

export const generateDocumentSwagger = {
    tags: ['Documents'],
    description: 'Generate a PDF from a template for a specific student. Returns a temporary download link.',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['templateId', 'studentId'],
        properties: {
            templateId: { type: 'string' },
            studentId: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                downloadUrl: { type: 'string' },
                expiresAt: { type: 'string', format: 'date-time' }
            }
        }
    }
};
