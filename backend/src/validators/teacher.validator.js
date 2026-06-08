import Joi from 'joi';

export const teacherQuerySchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(500).default(50),
    search: Joi.string().optional(),
    branch: Joi.string().optional(),
    school: Joi.string().optional(),
    accountStatus: Joi.string().valid('active', 'inactive', 'suspended').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});

export const upsertTeacherSchema = Joi.object({
    // User fields
    fullName: Joi.string().required().trim().min(2).max(100),
    email: Joi.string().required().email().lowercase(),
    phone: Joi.string().allow(null, '').optional(),
    password: Joi.string().min(6).when('$isUpdate', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
    branch: Joi.string().required(),
    school: Joi.string().allow(null, '').optional(),
    accountStatus: Joi.string().valid('active', 'inactive', 'suspended').default('active'),
    
    // Profile fields (EmployeeProfile)
    employeeId: Joi.string().required().trim(),
    designation: Joi.string().required().trim(),
    department: Joi.string().required().trim(),
    joiningDate: Joi.date().iso().required(),
    emergencyContact: Joi.string().allow(null, '').optional(),
    bankDetails: Joi.object({
        accountNo: Joi.string().allow(null, '').optional(),
        bankName: Joi.string().allow(null, '').optional(),
        branchName: Joi.string().allow(null, '').optional(),
        routingNo: Joi.string().allow(null, '').optional()
    }).optional()
});
