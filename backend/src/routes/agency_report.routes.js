import * as agencyReportController from '../controllers/agency_report.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';

export default async function agencyReportRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Partner Agencies'];
        });


        protectedRoutes.get('/performance', {
            preHandler: [requirePermission('view_agency_reports')]
        }, agencyReportController.getAgencyPerformanceReport);

        protectedRoutes.get('/financial-summary/:agencyId', {
            preHandler: [requirePermission('view_agency_reports')]
        }, agencyReportController.getAgencyFinancialSummary);

    }, { prefix: '/reports/agencies' });
}
