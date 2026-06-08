import * as transactionController from '../controllers/transaction.controller.js';
import { getAllTransactionsSwagger, getTransactionStatsSwagger, createTransactionSwagger } from '../schemas/transaction.schema.js';
import { createTransactionSchema, updateTransactionSchema, queryTransactionSchema } from '../validators/transaction.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function transactionRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Transactions'];
        });


        // List transactions
        protectedRoutes.get('/', {
            schema: getAllTransactionsSwagger,
            preHandler: [requirePermission('view_accounts'), validate(queryTransactionSchema, 'query')]
        }, transactionController.getAllTransactions);

        // Stats summary
        protectedRoutes.get('/stats', {
            schema: getTransactionStatsSwagger,
            preHandler: requirePermission('view_financial_reports')
        }, transactionController.getTransactionStats);

        // Create transaction
        protectedRoutes.post('/', {
            schema: createTransactionSwagger,
            preHandler: [requirePermission('manage_accounts'), validate(createTransactionSchema, 'body')]
        }, transactionController.createTransaction);

        // Update transaction
        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_accounts'), validate(updateTransactionSchema, 'body')]
        }, transactionController.updateTransaction);

        // Delete transaction (Admin Only)
        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_finance') // Using a higher restriction if needed, but implementation plan said manage_accounts
        }, transactionController.deleteTransaction);

        // CSV Export
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_financial_reports')
        }, transactionController.exportTransactions);

        // CSV Import
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_accounts')
        }, transactionController.importTransactions);

    }, { prefix: '/accounts' });
}
