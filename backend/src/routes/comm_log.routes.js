import * as commLogController from '../controllers/comm_log.controller.js';
import { getAllCommLogsSwagger, createCommLogSwagger } from '../schemas/comm_log.schema.js';
import { createCommLogSchema, updateCommLogSchema, queryCommLogSchema } from '../validators/comm_log.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function commLogRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Messages'];
        });


        // List logs
        protectedRoutes.get('/', {
            schema: getAllCommLogsSwagger,
            preHandler: [requirePermission('view_comm_logs'), validate(queryCommLogSchema, 'query')]
        }, commLogController.getAllLogs);

        // Get single log
        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_comm_logs')
        }, commLogController.getLogById);

        // Create log
        protectedRoutes.post('/', {
            schema: createCommLogSwagger,
            preHandler: [requirePermission('manage_comm_logs'), validate(createCommLogSchema, 'body')]
        }, commLogController.createLog);

        // Update log
        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_comm_logs'), validate(updateCommLogSchema, 'body')]
        }, commLogController.updateLog);

        // Delete log
        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_comm_logs')
        }, commLogController.deleteLog);

        // CSV Export
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_comm_logs')
        }, commLogController.exportLogs);

        // CSV Import
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_comm_logs')
        }, commLogController.importLogs);

    }, { prefix: '/communication-logs' });
}
