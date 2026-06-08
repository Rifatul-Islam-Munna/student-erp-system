export const visaApplicationResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        student: { type: ['string', 'object'] },
        school: { type: ['string', 'object', 'null'] },
        visaType: { type: 'string' },
        country: { type: 'string' },
        status: { type: 'string' },
        statusHistory: { type: 'array', items: { type: 'object' } },
        checklist: { type: 'array', items: { type: 'object' } },
        embassyAppointment: { type: 'object' },
        visaFee: { type: 'number' },
        passportNumber: { type: 'string' },
        applicationDate: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllVisaApplicationsSwagger = {
    tags: ['Visa Applications'],
    description: 'Get all visa applications with pagination and filtering',
    security: [{ bearerAuth: [] }],
    querystring: { type: 'object', properties: { page: { type: 'number' }, limit: { type: 'number' }, search: { type: 'string' }, status: { type: 'string' }, country: { type: 'string' }, student: { type: 'string' }, branch: { type: 'string' }, agent: { type: 'string' }, startDate: { type: 'string', format: 'date-time' }, endDate: { type: 'string', format: 'date-time' } } }
};

export const getVisaApplicationByIdSwagger = { tags: ['Visa Applications'], description: 'Get visa application details by ID with full history', security: [{ bearerAuth: [] }] };
export const createVisaApplicationSwagger = { tags: ['Visa Applications'], description: 'Create a new visa application with checklist and initial status', security: [{ bearerAuth: [] }] };
export const updateVisaApplicationSwagger = { tags: ['Visa Applications'], description: 'Update visa application (status changes auto-tracked in history)', security: [{ bearerAuth: [] }] };
export const updateChecklistSwagger = { tags: ['Visa Applications'], description: 'Update a checklist item completion status', security: [{ bearerAuth: [] }] };
export const getVisaPipelineSwagger = { tags: ['Visa Applications'], description: 'Get visa applications grouped by status for pipeline view', security: [{ bearerAuth: [] }], querystring: { type: 'object', properties: { branch: { type: 'string' }, country: { type: 'string' } } } };
export const exportVisaApplicationsSwagger = { tags: ['Visa Applications'], description: 'Export visa applications to CSV', security: [{ bearerAuth: [] }] };
