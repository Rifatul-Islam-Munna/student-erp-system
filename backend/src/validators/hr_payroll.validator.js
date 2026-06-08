import Joi from 'joi';

export const createEmployeeProfileSchema = Joi.object({
    user: Joi.string().required(),
    employeeId: Joi.string().required().trim(),
    designation: Joi.string().required().trim(),
    department: Joi.string().required().trim(),
    joiningDate: Joi.date().iso().required(),
    emergencyContact: Joi.string().allow('', null).trim(),
    bankDetails: Joi.object({
        accountNo: Joi.string().allow('', null).trim(),
        bankName: Joi.string().allow('', null).trim(),
        branchName: Joi.string().allow('', null).trim(),
        routingNo: Joi.string().allow('', null).trim()
    }).optional()
});

export const updateSalaryStructureSchema = Joi.object({
    basicSalary: Joi.number().min(0).required(),
    allowances: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        amount: Joi.number().min(0).required()
    })).default([]),
    deductions: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        amount: Joi.number().min(0).required()
    })).default([])
});

export const markAttendanceSchema = Joi.object({
    user: Joi.string().required(),
    date: Joi.date().iso().required(),
    status: Joi.string().valid('present', 'absent', 'late', 'leave', 'holiday', 'half_day').required(),
    checkIn: Joi.string().allow('', null).trim(),
    checkOut: Joi.string().allow('', null).trim(),
    remarks: Joi.string().allow('', null).trim()
});

export const generatePayrollSchema = Joi.object({
    month: Joi.number().min(1).max(12).required(),
    year: Joi.number().min(2020).required()
});

export const processPaymentSchema = Joi.object({
    paidAmount: Joi.number().positive().required(),
    paymentDate: Joi.date().iso().default(Date.now),
    linkToAccounts: Joi.boolean().default(true)
});

export const queryHRSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    department: Joi.string().optional(),
    designation: Joi.string().optional(),
    search: Joi.string().optional()
});
