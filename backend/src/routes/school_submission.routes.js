import * as schoolSubmissionController from '../controllers/school_submission.controller.js';
import {
    getAllSchoolSubmissionsSwagger,
    createSchoolSubmissionSwagger
} from '../schemas/school_submission.schema.js';
import {
    querySchoolSubmissionSchema,
    createSchoolSubmissionSchema,
    updateSchoolSubmissionSchema
} from '../validators/school_submission.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function schoolSubmissionRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Schools'];
        });


        protectedRoutes.get('/', {
            schema: getAllSchoolSubmissionsSwagger,
            preHandler: [requirePermission('view_school_submissions'), validate(querySchoolSubmissionSchema, 'query')]
        }, schoolSubmissionController.getAllSubmissions);

        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_school_submissions')
        }, schoolSubmissionController.exportSubmissions);

        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_school_submissions')
        }, schoolSubmissionController.importSubmissions);

        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_school_submissions')
        }, schoolSubmissionController.getSubmissionById);

        protectedRoutes.post('/', {
            schema: createSchoolSubmissionSwagger,
            preHandler: [requirePermission('manage_school_submissions'), validate(createSchoolSubmissionSchema, 'body')]
        }, schoolSubmissionController.createSubmission);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_school_submissions'), validate(updateSchoolSubmissionSchema, 'body')]
        }, schoolSubmissionController.updateSubmission);

        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_school_submissions')
        }, schoolSubmissionController.deleteSubmission);

        // Pipeline / Kanban Routes (Feature #4)
        protectedRoutes.get('/pipeline', {
            preHandler: requirePermission('view_pipeline')
        }, schoolSubmissionController.getSubmissionPipeline);

        protectedRoutes.patch('/batch-update', {
            preHandler: requirePermission('manage_pipeline')
        }, schoolSubmissionController.batchUpdateSubmissions);

    }, { prefix: '/school-submissions' });
}
