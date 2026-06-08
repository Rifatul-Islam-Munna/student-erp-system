import * as accountController from '../controllers/account.controller.js';
import { getAllAccountsSwagger, getProfitLossSwagger, getTaxReportSwagger } from '../schemas/account.schema.js';
import { 
    createAccountSchema, 
    updateAccountSchema, 
    queryAccountSchema,
    queryReportSchema
} from '../validators/account.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function accountRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Accounts'];
        });


        // --- Account Heads ---
        protectedRoutes.get('/', {
            schema: getAllAccountsSwagger,
            preHandler: [requirePermission('view_accounts'), validate(queryAccountSchema, 'query')]
        }, accountController.getAllAccounts);

        protectedRoutes.post('/', {
            preHandler: [requirePermission('manage_accounts'), validate(createAccountSchema, 'body')]
        }, accountController.createAccount);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_accounts'), validate(updateAccountSchema, 'body')]
        }, accountController.updateAccount);

        protectedRoutes.delete('/:id', {
            preHandler: [requirePermission('manage_accounts')]
        }, accountController.deleteAccount);

        // --- Reports ---
        protectedRoutes.get('/reports/profit-loss', {
            schema: getProfitLossSwagger,
            preHandler: [requirePermission('view_financial_reports'), validate(queryReportSchema, 'query')]
        }, accountController.getProfitLossReport);

        protectedRoutes.get('/reports/tax', {
            schema: getTaxReportSwagger,
            preHandler: [requirePermission('view_financial_reports'), validate(queryReportSchema, 'query')]
        }, accountController.getTaxReport);

        // --- Data Exchange ---
        protectedRoutes.get('/export', {
            preHandler: requirePermission('export_financial_data')
        }, accountController.exportAccounts);

        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_accounts')
        }, accountController.importAccounts);

    }, { prefix: '/accounting' });
}
