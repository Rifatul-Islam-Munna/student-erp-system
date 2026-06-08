import Joi from 'joi';

export const attendanceBaseSchema = {
    batch: Joi.string().required(),
    student: Joi.string().required(),
    date: Joi.date().iso().required(),
    status: Joi.string().valid('present', 'absent', 'late', 'leave').required(),
    remarks: Joi.string().allow('', null).trim()
};

export const bulkUpdateAttendanceSchema = Joi.object({
    batch: Joi.string().required(),
    date: Joi.date().iso().required(),
    records: Joi.array().items(Joi.object({
        student: Joi.string().required(),
        status: Joi.string().valid('present', 'absent', 'late', 'leave').required(),
        remarks: Joi.string().allow('', null).trim()
    })).min(1).required()
});

export const queryAttendanceSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    batch: Joi.string().optional(),
    student: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    status: Joi.string().valid('present', 'absent', 'late', 'leave').optional()
});
