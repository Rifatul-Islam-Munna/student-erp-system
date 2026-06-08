import Joi from 'joi';

export const queryDashboardSchema = Joi.object({
    branch: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});

export const queryRevenueTrendSchema = Joi.object({
    branch: Joi.string().optional(),
    period: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});

export const queryTopSchoolsSchema = Joi.object({
    limit: Joi.number().min(1).max(100).default(10)
});
