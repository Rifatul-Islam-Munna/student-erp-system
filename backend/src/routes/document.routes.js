import * as documentController from '../controllers/document.controller.js';
import {
    getAllDocumentTemplatesSwagger,
    createDocumentTemplateSwagger,
    generateDocumentSwagger
} from '../schemas/document.schema.js';
import {
    queryDocumentTemplateSchema,
    createDocumentTemplateSchema,
    updateDocumentTemplateSchema,
    generateDocumentSchema
} from '../validators/document.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function documentRoutes(fastify, options) {
    // Public download route (no auth — token-based access)
    fastify.get('/download/:token', { schema: { tags: ['Documents'] } }, documentController.downloadDocument);

    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Documents'];
        });


        // Template CRUD
        protectedRoutes.get('/', {
            schema: getAllDocumentTemplatesSwagger,
            preHandler: [requirePermission('view_documents'), validate(queryDocumentTemplateSchema, 'query')]
        }, documentController.getAllTemplates);

        protectedRoutes.get('/shortcodes', {
            preHandler: requirePermission('view_documents')
        }, documentController.getAvailableShortcodes);

        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_documents')
        }, documentController.exportTemplates);

        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_documents')
        }, documentController.importTemplates);

        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_documents')
        }, documentController.getTemplateById);

        protectedRoutes.post('/', {
            schema: createDocumentTemplateSwagger,
            preHandler: [requirePermission('manage_documents'), validate(createDocumentTemplateSchema, 'body')]
        }, documentController.createTemplate);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_documents'), validate(updateDocumentTemplateSchema, 'body')]
        }, documentController.updateTemplate);

        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_documents')
        }, documentController.deleteTemplate);

        // File upload for a template
        protectedRoutes.post('/:id/upload', {
            preHandler: requirePermission('manage_documents')
        }, documentController.uploadTemplateFile);

        // Generate PDF from template + student
        protectedRoutes.post('/generate', {
            schema: generateDocumentSwagger,
            preHandler: [requirePermission('manage_documents'), validate(generateDocumentSchema, 'body')]
        }, documentController.generateDocument);

    }, { prefix: '/documents' });
}
