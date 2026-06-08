import * as faqController from '../controllers/faq.controller.js';
import { getAllFAQsSwagger, createFAQSwagger } from '../schemas/faq.schema.js';
import { createFAQSchema, updateFAQSchema, queryFAQSchema } from '../validators/faq.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function faqRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Settings'];
        });


        // List FAQs
        protectedRoutes.get('/', {
            schema: getAllFAQsSwagger,
            preHandler: [requirePermission('view_faqs'), validate(queryFAQSchema, 'query')]
        }, faqController.getAllFAQs);

        // Create FAQ
        protectedRoutes.post('/', {
            schema: createFAQSwagger,
            preHandler: [requirePermission('manage_faqs'), validate(createFAQSchema, 'body')]
        }, faqController.createFAQ);

        // Update FAQ
        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_faqs'), validate(updateFAQSchema, 'body')]
        }, faqController.updateFAQ);

        // Delete FAQ
        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_faqs')
        }, faqController.deleteFAQ);

        // CSV Export
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_faqs')
        }, faqController.exportFAQs);

        // CSV Import
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_faqs')
        }, faqController.importFAQs);

    }, { prefix: '/faqs' });
}
