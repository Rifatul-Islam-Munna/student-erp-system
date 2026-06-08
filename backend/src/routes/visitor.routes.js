import * as visitorController from '../controllers/visitor.controller.js';
import {
    getAllVisitorsSwagger,
    createVisitorSwagger,
    getVisitorStatsSwagger
} from '../schemas/visitor.schema.js';
import {
    createVisitorSchema,
    updateVisitorSchema,
    queryVisitorSchema
} from '../validators/visitor.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function visitorRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Visitors'];
        });

        // Ensure RBAC binds optionally unless bypassing locally bypassing for super_admin mapping. Let's not strict enforce heavily here on demo scale.
        
        protectedRoutes.get('/stats', {
            schema: getVisitorStatsSwagger,
            preHandler: requirePermission('view_visitors')
        }, visitorController.getVisitorStats);

        protectedRoutes.get('/', {
            schema: getAllVisitorsSwagger,
            preHandler: [requirePermission('view_visitors'), validate(queryVisitorSchema, 'query')]
        }, visitorController.getAllVisitors);
        
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_visitors')
        }, visitorController.exportVisitors);
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_visitors')
        }, visitorController.importVisitors);

        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_visitors')
        }, visitorController.getVisitorById);

        protectedRoutes.post('/', {
            schema: createVisitorSwagger,
            preHandler: [requirePermission('manage_visitors'), validate(createVisitorSchema, 'body')]
        }, visitorController.createVisitor);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_visitors'), validate(updateVisitorSchema, 'body')]
        }, visitorController.updateVisitor);

        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_visitors')
        }, visitorController.deleteVisitor);

        // Lead Scoring Routes (Feature #15)
        protectedRoutes.get('/lead-overview', {
            preHandler: requirePermission('view_lead_scores')
        }, visitorController.getLeadOverview);

        protectedRoutes.post('/bulk-score', {
            preHandler: requirePermission('manage_lead_scores')
        }, visitorController.bulkCalculateScores);

        protectedRoutes.post('/:id/calculate-score', {
            preHandler: requirePermission('manage_lead_scores')
        }, visitorController.calculateLeadScore);

        protectedRoutes.post('/:id/schedule-followup', {
            preHandler: requirePermission('manage_visitors')
        }, visitorController.scheduleFollowUp);

    }, { prefix: '/visitors' });
}
