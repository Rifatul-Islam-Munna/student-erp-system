import * as targetController from '../controllers/target.controller.js';
import { getAllTargetsSwagger, getTargetByIdSwagger, createTargetSwagger, updateTargetSwagger, refreshTargetSwagger, getLeaderboardSwagger, exportTargetsSwagger } from '../schemas/target.schema.js';
import { createTargetSchema, updateTargetSchema, queryTargetSchema } from '../validators/target.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function targetRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);
        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Targets & Goals'];
        });

        // List
        protectedRoutes.get('/', { schema: getAllTargetsSwagger, preHandler: [requirePermission('view_targets'), validate(queryTargetSchema, 'query')] }, targetController.getAllTargets);

        // Leaderboard
        protectedRoutes.get('/leaderboard', { schema: getLeaderboardSwagger, preHandler: requirePermission('view_targets') }, targetController.getLeaderboard);

        // Export
        protectedRoutes.get('/export', { schema: exportTargetsSwagger, preHandler: requirePermission('view_targets') }, targetController.exportTargets);

        // Import
        protectedRoutes.post('/import', { preHandler: requirePermission('manage_targets') }, targetController.importTargets);

        // Get by ID
        protectedRoutes.get('/:id', { schema: getTargetByIdSwagger, preHandler: requirePermission('view_targets') }, targetController.getTargetById);

        // Create
        protectedRoutes.post('/', { schema: createTargetSwagger, preHandler: [requirePermission('manage_targets'), validate(createTargetSchema, 'body')] }, targetController.createTarget);

        // Update
        protectedRoutes.put('/:id', { schema: updateTargetSwagger, preHandler: [requirePermission('manage_targets'), validate(updateTargetSchema, 'body')] }, targetController.updateTarget);

        // Refresh from real data
        protectedRoutes.post('/:id/refresh', { schema: refreshTargetSwagger, preHandler: requirePermission('manage_targets') }, targetController.refreshTarget);

        // Delete
        protectedRoutes.delete('/:id', { preHandler: requirePermission('manage_targets') }, targetController.deleteTarget);

    }, { prefix: '/targets' });
}
