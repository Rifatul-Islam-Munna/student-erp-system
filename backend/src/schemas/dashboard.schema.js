export const dashboardResponseSchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        stat: { type: ['number', 'string'] },
        variant: { type: 'string' },
        change: { type: 'string' },
        icon: { type: 'string' }
    }
};

export const getSummarySwagger = {
    tags: ['Dashboard'],
    description: 'Get dashboard summary with real month-over-month growth calculations',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            branch: { type: 'string', description: 'Filter by branch ID' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: dashboardResponseSchema }
            }
        }
    }
};

export const getRevenueTrendSwagger = {
    tags: ['Dashboard'],
    description: 'Get revenue trend data (daily/weekly/monthly) for charts',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            branch: { type: 'string' },
            period: { type: 'string', enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    }
};

export const getConversionFunnelSwagger = {
    tags: ['Dashboard'],
    description: 'Get lead-to-student conversion funnel (Visitor → Student → Submitted → COE → Visa)',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            branch: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    }
};

export const getAgentScorecardsSwagger = {
    tags: ['Dashboard'],
    description: 'Get agent/counselor performance scorecards ranked by students and revenue',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            branch: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    }
};

export const getBranchComparisonSwagger = {
    tags: ['Dashboard'],
    description: 'Get branch-wise comparative analytics (students, revenue, visitors)',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    }
};

export const getIntakeForecastSwagger = {
    tags: ['Dashboard'],
    description: 'Get intake pipeline forecasting with submission status breakdown and upcoming deadlines',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            branch: { type: 'string' }
        }
    }
};

export const getTopSchoolsSwagger = {
    tags: ['Dashboard'],
    description: 'Get top-performing schools ranked by acceptance rate',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            limit: { type: 'number', default: 10 }
        }
    }
};
