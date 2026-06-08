import Joi from 'joi';

export const createTargetSchema = Joi.object({
    title: Joi.string().required().trim().min(2).max(200),
    description: Joi.string().allow('', null).trim(),
    metric: Joi.string().valid('students_enrolled', 'revenue_collected', 'submissions_made', 'visitors_converted', 'visa_approved', 'custom').required(),
    targetValue: Joi.number().min(0).required(),
    currentValue: Joi.number().min(0).default(0),
    period: Joi.string().valid('monthly', 'quarterly', 'yearly').required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    assignedTo: Joi.string().allow(null),
    assignedRole: Joi.string().valid('agent', 'counselor', 'branch', 'admin', '').default(''),
    branch: Joi.string().allow(null),
    incentive: Joi.object({
        type: Joi.string().valid('fixed', 'percentage', 'bonus', '').default(''),
        amount: Joi.number().min(0).default(0),
        description: Joi.string().allow('', null).trim()
    })
});

export const updateTargetSchema = Joi.object({
    title: Joi.string().trim().min(2).max(200),
    description: Joi.string().allow('', null).trim(),
    metric: Joi.string().valid('students_enrolled', 'revenue_collected', 'submissions_made', 'visitors_converted', 'visa_approved', 'custom'),
    targetValue: Joi.number().min(0),
    currentValue: Joi.number().min(0),
    period: Joi.string().valid('monthly', 'quarterly', 'yearly'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    assignedTo: Joi.string().allow(null),
    assignedRole: Joi.string().valid('agent', 'counselor', 'branch', 'admin', ''),
    branch: Joi.string().allow(null),
    status: Joi.string().valid('active', 'completed', 'exceeded', 'missed', 'cancelled'),
    incentive: Joi.object({
        type: Joi.string().valid('fixed', 'percentage', 'bonus', ''),
        amount: Joi.number().min(0),
        description: Joi.string().allow('', null).trim()
    })
});

export const queryTargetSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(500).default(10),
    search: Joi.string().optional(),
    metric: Joi.string().optional(),
    period: Joi.string().optional(),
    status: Joi.string().optional(),
    assignedTo: Joi.string().optional(),
    branch: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});
