import * as invoiceController from '../controllers/invoice.controller.js';
import { getAllInvoicesSwagger, getInvoiceByIdSwagger, createInvoiceSwagger, recordPaymentSwagger, getInvoiceStatsSwagger, exportInvoicesSwagger } from '../schemas/invoice.schema.js';
import { createInvoiceSchema, updateInvoiceSchema, recordPaymentSchema, queryInvoiceSchema } from '../validators/invoice.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function invoiceRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);
        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Invoices'];
        });

        // List invoices
        protectedRoutes.get('/', { schema: getAllInvoicesSwagger, preHandler: [requirePermission('view_invoices'), validate(queryInvoiceSchema, 'query')] }, invoiceController.getAllInvoices);

        // Invoice stats
        protectedRoutes.get('/stats', { schema: getInvoiceStatsSwagger, preHandler: requirePermission('view_invoices') }, invoiceController.getInvoiceStats);

        // Export CSV
        protectedRoutes.get('/export', { schema: exportInvoicesSwagger, preHandler: requirePermission('view_invoices') }, invoiceController.exportInvoices);

        // Import CSV
        protectedRoutes.post('/import', { preHandler: requirePermission('manage_invoices') }, invoiceController.importInvoices);

        // Get by ID
        protectedRoutes.get('/:id', { schema: getInvoiceByIdSwagger, preHandler: requirePermission('view_invoices') }, invoiceController.getInvoiceById);

        // Create
        protectedRoutes.post('/', { schema: createInvoiceSwagger, preHandler: [requirePermission('manage_invoices'), validate(createInvoiceSchema, 'body')] }, invoiceController.createInvoice);

        // Update
        protectedRoutes.put('/:id', { preHandler: [requirePermission('manage_invoices'), validate(updateInvoiceSchema, 'body')] }, invoiceController.updateInvoice);

        // Record payment
        protectedRoutes.post('/:id/record-payment', { schema: recordPaymentSwagger, preHandler: [requirePermission('manage_invoices'), validate(recordPaymentSchema, 'body')] }, invoiceController.recordPayment);

        // Delete
        protectedRoutes.delete('/:id', { preHandler: requirePermission('manage_invoices') }, invoiceController.deleteInvoice);

    }, { prefix: '/invoices' });
}
