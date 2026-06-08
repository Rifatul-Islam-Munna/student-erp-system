import * as auditLogController from '../controllers/audit_log.controller.js';
import { getAllAuditLogsSwagger, getAuditLogByIdSwagger, getEntityHistorySwagger, getAuditStatsSwagger, purgeAuditLogsSwagger, exportAuditLogsSwagger } from '../schemas/audit_log.schema.js';
import { queryAuditLogSchema, purgeAuditLogSchema } from '../validators/audit_log.validator.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function auditLogRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Audit Logs'];
        });

        // List all audit logs
        protectedRoutes.get('/', {
            schema: getAllAuditLogsSwagger,
            preHandler: [requirePermission('view_audit_logs'), validate(queryAuditLogSchema, 'query')]
        }, auditLogController.getAllAuditLogs);

        // Audit stats
        protectedRoutes.get('/stats', {
            schema: getAuditStatsSwagger,
            preHandler: requirePermission('view_audit_logs')
        }, auditLogController.getAuditStats);

        // Export to CSV
        protectedRoutes.get('/export', {
            schema: exportAuditLogsSwagger,
            preHandler: requirePermission('view_audit_logs')
        }, auditLogController.exportAuditLogs);

        // Entity history
        protectedRoutes.get('/entity/:entityType/:entityId', {
            schema: getEntityHistorySwagger,
            preHandler: requirePermission('view_audit_logs')
        }, auditLogController.getEntityHistory);

        // Single audit log
        protectedRoutes.get('/:id', {
            schema: getAuditLogByIdSwagger,
            preHandler: requirePermission('view_audit_logs')
        }, auditLogController.getAuditLogById);

        // Purge old logs
        protectedRoutes.delete('/purge', {
            schema: purgeAuditLogsSwagger,
            preHandler: [authorize(['super_admin']), validate(purgeAuditLogSchema, 'body')]
        }, auditLogController.purgeAuditLogs);

    }, { prefix: '/audit-logs' });
}
