export const attendanceResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        batch: { type: ['string', 'object'] },
        student: { type: ['string', 'object'] },
        date: { type: 'string', format: 'date-time' },
        status: { type: 'string' },
        remarks: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllAttendanceSwagger = {
    tags: ['Attendance'],
    description: 'Get all attendance records with filters and pagination',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            batch: { type: 'string' },
            student: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: attendanceResponseSchema
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

export const bulkUpdateAttendanceSwagger = {
    tags: ['Attendance'],
    description: 'Bulk update attendance for a batch on a specific date',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['batch', 'date', 'records'],
        properties: {
            batch: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            records: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['student', 'status'],
                    properties: {
                        student: { type: 'string' },
                        status: { type: 'string', enum: ['present', 'absent', 'late', 'leave'] },
                        remarks: { type: 'string' }
                    }
                }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                processedCount: { type: 'number' }
            }
        }
    }
};
