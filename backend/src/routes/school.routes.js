import * as schoolController from '../controllers/school.controller.js';
import {
    getAllSchoolsSwagger,
    createSchoolSwagger
} from '../schemas/school.schema.js';
import {
    querySchoolSchema,
    createSchoolSchema,
    updateSchoolSchema
} from '../validators/school.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function schoolRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Schools'];
        });


        protectedRoutes.get('/', {
            schema: getAllSchoolsSwagger,
            preHandler: [requirePermission('view_schools'), validate(querySchoolSchema, 'query')]
        }, schoolController.getAllSchools);

        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_schools')
        }, schoolController.exportSchools);

        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_schools')
        }, schoolController.importSchools);

        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_schools')
        }, schoolController.getSchoolById);

        protectedRoutes.post('/', {
            schema: createSchoolSwagger,
            preHandler: [requirePermission('manage_schools'), validate(createSchoolSchema, 'body')]
        }, schoolController.createSchool);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_schools'), validate(updateSchoolSchema, 'body')]
        }, schoolController.updateSchool);

        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_schools')
        }, schoolController.deleteSchool);

    }, { prefix: '/schools' });
}
