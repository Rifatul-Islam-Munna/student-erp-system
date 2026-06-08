import * as dashboardController from '../controllers/dashboard.controller.js';
import { getSummarySwagger, getRevenueTrendSwagger, getConversionFunnelSwagger, getAgentScorecardsSwagger, getBranchComparisonSwagger, getIntakeForecastSwagger, getTopSchoolsSwagger } from '../schemas/dashboard.schema.js';
import { queryDashboardSchema, queryRevenueTrendSchema, queryTopSchoolsSchema } from '../validators/dashboard.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function dashboardRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Dashboard'];
        });

        // Core summary
        protectedRoutes.get('/summary', {
            schema: getSummarySwagger,
            preHandler: [requirePermission('view_dashboard'), validate(queryDashboardSchema, 'query')]
        }, dashboardController.getSummary);

        // Revenue trend (daily/weekly/monthly)
        protectedRoutes.get('/revenue-trend', {
            schema: getRevenueTrendSwagger,
            preHandler: [requirePermission('view_dashboard'), validate(queryRevenueTrendSchema, 'query')]
        }, dashboardController.getRevenueTrend);

        // Conversion funnel
        protectedRoutes.get('/conversion-funnel', {
            schema: getConversionFunnelSwagger,
            preHandler: [requirePermission('view_dashboard'), validate(queryDashboardSchema, 'query')]
        }, dashboardController.getConversionFunnel);

        // Agent scorecards
        protectedRoutes.get('/agent-scorecards', {
            schema: getAgentScorecardsSwagger,
            preHandler: [requirePermission('view_dashboard'), validate(queryDashboardSchema, 'query')]
        }, dashboardController.getAgentScorecards);

        // Branch comparison
        protectedRoutes.get('/branch-comparison', {
            schema: getBranchComparisonSwagger,
            preHandler: [requirePermission('view_dashboard'), validate(queryDashboardSchema, 'query')]
        }, dashboardController.getBranchComparison);

        // Intake forecast
        protectedRoutes.get('/intake-forecast', {
            schema: getIntakeForecastSwagger,
            preHandler: [requirePermission('view_dashboard'), validate(queryDashboardSchema, 'query')]
        }, dashboardController.getIntakeForecast);

        // Top schools
        protectedRoutes.get('/top-schools', {
            schema: getTopSchoolsSwagger,
            preHandler: [requirePermission('view_dashboard'), validate(queryTopSchoolsSchema, 'query')]
        }, dashboardController.getTopSchools);

    }, { prefix: '/dashboard' });
}
