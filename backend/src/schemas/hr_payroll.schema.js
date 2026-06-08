export const employeeProfileResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        user: {
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' }
            }
        },
        employeeId: { type: 'string' },
        designation: { type: 'string' },
        department: { type: 'string' },
        joiningDate: { type: 'string', format: 'date-time' },
        emergencyContact: { type: 'string' },
        bankDetails: {
            type: 'object',
            properties: {
                accountNo: { type: 'string' },
                bankName: { type: 'string' },
                branchName: { type: 'string' },
                routingNo: { type: 'string' }
            }
        }
    }
};

export const payrollResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        user: {
            type: ['string', 'object'],
            properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' }
            }
        },
        month: { type: 'number' },
        year: { type: 'number' },
        basicSalary: { type: 'number' },
        totalAllowances: { type: 'number' },
        totalDeductions: { type: 'number' },
        attendanceDeduction: { type: 'number' },
        netPayable: { type: 'number' },
        paidAmount: { type: 'number' },
        status: { type: 'string' },
        paymentDate: { type: 'string', format: 'date-time' }
    }
};

export const getAllEmployeesSwagger = {
    tags: ['HR & Payroll'],
    description: 'Get all employee profiles',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            department: { type: 'string' },
            search: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: employeeProfileResponseSchema }
            }
        }
    }
};

export const generatePayrollSwagger = {
    tags: ['HR & Payroll'],
    description: 'Bulk generate payroll records for a month',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['month', 'year'],
        properties: {
            month: { type: 'number' },
            year: { type: 'number' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                count: { type: 'number' }
            }
        }
    }
};
