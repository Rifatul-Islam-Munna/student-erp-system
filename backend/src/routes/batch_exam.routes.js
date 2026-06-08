import * as batchExamController from '../controllers/batch_exam.controller.js';
import {
    getAllBatchExamsSwagger,
    createBatchExamSwagger
} from '../schemas/batch_exam.schema.js';
import {
    getAllBatchExamResultsSwagger,
    createBatchExamResultSwagger
} from '../schemas/batch_exam_result.schema.js';
import {
    createBatchExamSchema,
    updateBatchExamSchema,
    queryBatchExamSchema
} from '../validators/batch_exam.validator.js';
import {
    createBatchExamResultSchema,
    updateBatchExamResultSchema,
    queryBatchExamResultSchema
} from '../validators/batch_exam_result.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function batchExamRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Batches'];
        });


        // --- BATCH EXAMS ---
        protectedRoutes.get('/', {
            schema: getAllBatchExamsSwagger,
            preHandler: [requirePermission('view_batch_exams'), validate(queryBatchExamSchema, 'query')]
        }, batchExamController.getAllBatchExams);

        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_batch_exams')
        }, batchExamController.getBatchExamById);

        protectedRoutes.post('/', {
            schema: createBatchExamSwagger,
            preHandler: [requirePermission('manage_batch_exams'), validate(createBatchExamSchema, 'body')]
        }, batchExamController.createBatchExam);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_batch_exams'), validate(updateBatchExamSchema, 'body')]
        }, batchExamController.updateBatchExam);

        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_batch_exams')
        }, batchExamController.deleteBatchExam);


        // --- BATCH EXAM RESULTS ---
        protectedRoutes.get('/results', {
            schema: getAllBatchExamResultsSwagger,
            preHandler: [requirePermission('view_batch_exams'), validate(queryBatchExamResultSchema, 'query')]
        }, batchExamController.getAllBatchExamResults);

        protectedRoutes.get('/results/:id', {
            preHandler: requirePermission('view_batch_exams')
        }, batchExamController.getBatchExamResultById);

        protectedRoutes.post('/results', {
            schema: createBatchExamResultSwagger,
            preHandler: [requirePermission('manage_batch_exams'), validate(createBatchExamResultSchema, 'body')]
        }, batchExamController.createBatchExamResult);

        protectedRoutes.put('/results/:id', {
            preHandler: [requirePermission('manage_batch_exams'), validate(updateBatchExamResultSchema, 'body')]
        }, batchExamController.updateBatchExamResult);

        protectedRoutes.delete('/results/:id', {
            preHandler: requirePermission('manage_batch_exams')
        }, batchExamController.deleteBatchExamResult);

    }, { prefix: '/batch-exams' });
}
