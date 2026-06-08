import * as batchEnrolledController from '../controllers/batch_enrolled.controller.js';
import {
    getAllBatchEnrolledSwagger,
    createBatchEnrolledSwagger
} from '../schemas/batch_enrolled.schema.js';
import {
    createBatchEnrolledSchema,
    updateBatchEnrolledSchema,
    queryBatchEnrolledSchema
} from '../validators/batch_enrolled.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function batchEnrolledRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Batches'];
        });

        
        protectedRoutes.get('/', {
            schema: getAllBatchEnrolledSwagger,
            preHandler: [requirePermission('view_batch_enrolled'), validate(queryBatchEnrolledSchema, 'query')]
        }, batchEnrolledController.getAllBatchEnrolled);

        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_batch_enrolled')
        }, batchEnrolledController.getBatchEnrolledById);

        protectedRoutes.post('/', {
            schema: createBatchEnrolledSwagger,
            preHandler: [requirePermission('manage_batch_enrolled'), validate(createBatchEnrolledSchema, 'body')]
        }, batchEnrolledController.createBatchEnrolled);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_batch_enrolled'), validate(updateBatchEnrolledSchema, 'body')]
        }, batchEnrolledController.updateBatchEnrolled);

        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_batch_enrolled')
        }, batchEnrolledController.deleteBatchEnrolled);

    }, { prefix: '/batch-enrolled' });
}
