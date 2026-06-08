import * as workflowController from '../controllers/workflow.controller.js';
import { getAllWorkflowRulesSwagger, getWorkflowRuleByIdSwagger, createWorkflowRuleSwagger, updateWorkflowRuleSwagger, toggleWorkflowRuleSwagger, exportWorkflowRulesSwagger } from '../schemas/workflow.schema.js';
import { createWorkflowRuleSchema, updateWorkflowRuleSchema, queryWorkflowRuleSchema } from '../validators/workflow.validator.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function workflowRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);
        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Workflow Engine'];
        });

        // List
        protectedRoutes.get('/', { schema: getAllWorkflowRulesSwagger, preHandler: [requirePermission('view_workflows'), validate(queryWorkflowRuleSchema, 'query')] }, workflowController.getAllWorkflowRules);

        // Export
        protectedRoutes.get('/export', { schema: exportWorkflowRulesSwagger, preHandler: requirePermission('view_workflows') }, workflowController.exportWorkflowRules);

        // Import
        protectedRoutes.post('/import', { preHandler: requirePermission('manage_workflows') }, workflowController.importWorkflowRules);

        // Get by ID
        protectedRoutes.get('/:id', { schema: getWorkflowRuleByIdSwagger, preHandler: requirePermission('view_workflows') }, workflowController.getWorkflowRuleById);

        // Create
        protectedRoutes.post('/', { schema: createWorkflowRuleSwagger, preHandler: [requirePermission('manage_workflows'), validate(createWorkflowRuleSchema, 'body')] }, workflowController.createWorkflowRule);

        // Update
        protectedRoutes.put('/:id', { schema: updateWorkflowRuleSwagger, preHandler: [requirePermission('manage_workflows'), validate(updateWorkflowRuleSchema, 'body')] }, workflowController.updateWorkflowRule);

        // Toggle active/inactive
        protectedRoutes.patch('/:id/toggle', { schema: toggleWorkflowRuleSwagger, preHandler: requirePermission('manage_workflows') }, workflowController.toggleWorkflowRule);

        // Delete
        protectedRoutes.delete('/:id', { preHandler: requirePermission('manage_workflows') }, workflowController.deleteWorkflowRule);

    }, { prefix: '/workflow-rules' });
}
