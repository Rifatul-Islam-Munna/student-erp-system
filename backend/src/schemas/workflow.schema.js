export const workflowRuleResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        triggerEvent: { type: 'string' },
        isActive: { type: 'boolean' },
        conditions: { type: 'array', items: { type: 'object' } },
        actions: { type: 'array', items: { type: 'object' } },
        executionCount: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllWorkflowRulesSwagger = {
    tags: ['Workflow Engine'],
    description: 'Get all workflow automation rules with pagination and filtering',
    security: [{ bearerAuth: [] }],
    querystring: { type: 'object', properties: { page: { type: 'number' }, limit: { type: 'number' }, search: { type: 'string' }, triggerEvent: { type: 'string' }, isActive: { type: 'string' }, branch: { type: 'string' } } }
};

export const getWorkflowRuleByIdSwagger = { tags: ['Workflow Engine'], description: 'Get workflow rule by ID', security: [{ bearerAuth: [] }] };
export const createWorkflowRuleSwagger = { tags: ['Workflow Engine'], description: 'Create a new workflow automation rule with trigger, conditions, and actions', security: [{ bearerAuth: [] }] };
export const updateWorkflowRuleSwagger = { tags: ['Workflow Engine'], description: 'Update workflow rule configuration', security: [{ bearerAuth: [] }] };
export const toggleWorkflowRuleSwagger = { tags: ['Workflow Engine'], description: 'Toggle workflow rule active/inactive status', security: [{ bearerAuth: [] }] };
export const exportWorkflowRulesSwagger = { tags: ['Workflow Engine'], description: 'Export workflow rules to CSV', security: [{ bearerAuth: [] }] };
