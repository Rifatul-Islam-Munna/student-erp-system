import * as visaController from '../controllers/visa_application.controller.js';
import { getAllVisaApplicationsSwagger, getVisaApplicationByIdSwagger, createVisaApplicationSwagger, updateVisaApplicationSwagger, updateChecklistSwagger, getVisaPipelineSwagger, exportVisaApplicationsSwagger } from '../schemas/visa_application.schema.js';
import { createVisaApplicationSchema, updateVisaApplicationSchema, updateChecklistSchema, queryVisaApplicationSchema } from '../validators/visa_application.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function visaApplicationRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);
        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Visa Applications'];
        });

        // List
        protectedRoutes.get('/', { schema: getAllVisaApplicationsSwagger, preHandler: [requirePermission('view_visa_applications'), validate(queryVisaApplicationSchema, 'query')] }, visaController.getAllVisaApplications);

        // Pipeline view
        protectedRoutes.get('/pipeline', { schema: getVisaPipelineSwagger, preHandler: requirePermission('view_visa_applications') }, visaController.getVisaPipeline);

        // Export
        protectedRoutes.get('/export', { schema: exportVisaApplicationsSwagger, preHandler: requirePermission('view_visa_applications') }, visaController.exportVisaApplications);

        // Import
        protectedRoutes.post('/import', { preHandler: requirePermission('manage_visa_applications') }, visaController.importVisaApplications);

        // Get by ID
        protectedRoutes.get('/:id', { schema: getVisaApplicationByIdSwagger, preHandler: requirePermission('view_visa_applications') }, visaController.getVisaApplicationById);

        // Create
        protectedRoutes.post('/', { schema: createVisaApplicationSwagger, preHandler: [requirePermission('manage_visa_applications'), validate(createVisaApplicationSchema, 'body')] }, visaController.createVisaApplication);

        // Update
        protectedRoutes.put('/:id', { schema: updateVisaApplicationSwagger, preHandler: [requirePermission('manage_visa_applications'), validate(updateVisaApplicationSchema, 'body')] }, visaController.updateVisaApplication);

        // Update checklist item
        protectedRoutes.patch('/:id/checklist', { schema: updateChecklistSwagger, preHandler: [requirePermission('manage_visa_applications'), validate(updateChecklistSchema, 'body')] }, visaController.updateChecklist);

        // Delete
        protectedRoutes.delete('/:id', { preHandler: requirePermission('manage_visa_applications') }, visaController.deleteVisaApplication);

    }, { prefix: '/visa-applications' });
}
