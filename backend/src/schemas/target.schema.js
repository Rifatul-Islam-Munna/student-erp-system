export const targetResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        title: { type: 'string' },
        metric: { type: 'string' },
        targetValue: { type: 'number' },
        currentValue: { type: 'number' },
        achievementPercentage: { type: 'number' },
        period: { type: 'string' },
        status: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllTargetsSwagger = {
    tags: ['Targets & Goals'],
    description: 'Get all targets with pagination, filtering by metric, period, status, assignee',
    security: [{ bearerAuth: [] }],
    querystring: { type: 'object', properties: { page: { type: 'number' }, limit: { type: 'number' }, search: { type: 'string' }, metric: { type: 'string' }, period: { type: 'string' }, status: { type: 'string' }, assignedTo: { type: 'string' }, branch: { type: 'string' }, startDate: { type: 'string', format: 'date-time' }, endDate: { type: 'string', format: 'date-time' } } }
};

export const getTargetByIdSwagger = { tags: ['Targets & Goals'], description: 'Get target details by ID', security: [{ bearerAuth: [] }] };
export const createTargetSwagger = { tags: ['Targets & Goals'], description: 'Create a new target/goal with metric and incentive configuration', security: [{ bearerAuth: [] }] };
export const updateTargetSwagger = { tags: ['Targets & Goals'], description: 'Update target (auto-recalculates achievement percentage)', security: [{ bearerAuth: [] }] };
export const refreshTargetSwagger = { tags: ['Targets & Goals'], description: 'Refresh target current value from real database data', security: [{ bearerAuth: [] }] };
export const getLeaderboardSwagger = { tags: ['Targets & Goals'], description: 'Get leaderboard ranking users by target achievement', security: [{ bearerAuth: [] }], querystring: { type: 'object', properties: { period: { type: 'string' }, metric: { type: 'string' } } } };
export const exportTargetsSwagger = { tags: ['Targets & Goals'], description: 'Export targets to CSV', security: [{ bearerAuth: [] }] };
