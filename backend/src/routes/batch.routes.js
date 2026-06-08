import * as batchController from '../controllers/batch.controller.js';
import {
    getAllBatchesSwagger,
    getBatchStatsSwagger,
    createBatchSwagger,
    updateBatchSwagger,
    deleteBatchSwagger
} from '../schemas/batch.schema.js';
import {
    createBatchSchema,
    updateBatchSchema,
    queryBatchSchema
} from '../validators/batch.validator.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function batchRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Batches'];
        });


        protectedRoutes.get('/stats', {
            schema: getBatchStatsSwagger,
            preHandler: requirePermission('view_batches')
        }, batchController.getBatchStats);

        protectedRoutes.get('/', {
            schema: getAllBatchesSwagger,
            preHandler: [requirePermission('view_batches'), validate(queryBatchSchema, 'query')]
        }, batchController.getAllBatches);
        
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_batches')
        }, batchController.exportBatches);
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_batches')
        }, batchController.importBatches);

        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_batches')
        }, batchController.getBatchById);

        protectedRoutes.post('/', {
            schema: createBatchSwagger,
            preHandler: [requirePermission('manage_batches'), validate(createBatchSchema, 'body')]
        }, batchController.createBatch);

        protectedRoutes.put('/:id', {
            schema: updateBatchSwagger,
            preHandler: [requirePermission('manage_batches'), validate(updateBatchSchema, 'body')]
        }, batchController.updateBatch);

        protectedRoutes.delete('/:id', {
            schema: deleteBatchSwagger,
            preHandler: requirePermission('manage_batches')
        }, batchController.deleteBatch);

    }, { prefix: '/batches' });
}
