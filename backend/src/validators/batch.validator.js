import Joi from 'joi';

export const createBatchSchema = Joi.object({
    batchName: Joi.string().trim().required().messages({
        'any.required': 'Batch Name is required',
        'string.empty': 'Batch Name cannot be empty'
    }),
    country: Joi.string().trim().optional().allow(null, ''),
    level: Joi.string().trim().optional().allow(null, ''),
    startDate: Joi.date().iso().optional().allow(null, ''),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().allow(null, '').messages({
        'date.min': 'End Date must be after or equal to Start Date'
    }),
    maxStudents: Joi.number().min(1).optional().allow(null, ''),
    teacher: Joi.string().trim().optional().allow(null, ''),
    branch: Joi.string().trim().optional().allow(null, ''),
    classDays: Joi.array().items(Joi.string().valid('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')).optional().default([]),
    classTime: Joi.string().trim().optional().allow(null, ''),
    classDuration: Joi.number().min(0.5).optional().allow(null, ''),
    courseName: Joi.string().trim().optional().allow(null, ''),
    status: Joi.string().trim().optional().allow(null, ''),
    enrolledStudents: Joi.number().min(0).optional().allow(null, ''),
    fees: Joi.number().min(0).optional().allow(null, ''),
    description: Joi.string().trim().optional().allow(null, '')
});

export const updateBatchSchema = Joi.object({
    batchName: Joi.string().trim().optional(),
    country: Joi.string().trim().optional().allow(null, ''),
    level: Joi.string().trim().optional().allow(null, ''),
    startDate: Joi.date().iso().optional().allow(null, ''),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().allow(null, '').messages({
        'date.min': 'End Date must be after or equal to Start Date'
    }),
    maxStudents: Joi.number().min(1).optional().allow(null, ''),
    teacher: Joi.string().trim().optional().allow(null, ''),
    branch: Joi.string().trim().optional().allow(null, ''),
    classDays: Joi.array().items(Joi.string().valid('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')).optional(),
    classTime: Joi.string().trim().optional().allow(null, ''),
    classDuration: Joi.number().min(0.5).optional().allow(null, ''),
    courseName: Joi.string().trim().optional().allow(null, ''),
    status: Joi.string().trim().optional().allow(null, ''),
    enrolledStudents: Joi.number().min(0).optional().allow(null, ''),
    fees: Joi.number().min(0).optional().allow(null, ''),
    description: Joi.string().trim().optional().allow(null, '')
});

export const queryBatchSchema = Joi.object({
    page: Joi.number().min(1).optional().default(1),
    limit: Joi.number().min(1).max(100).optional().default(10),
    search: Joi.string().trim().optional().allow(''),
    branch: Joi.string().trim().optional().allow(''),
    country: Joi.string().trim().optional().allow(''),
    startDate: Joi.date().iso().optional().allow(''),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().allow('').messages({
        'date.min': 'End Date must be after or equal to Start Date'
    })
});
