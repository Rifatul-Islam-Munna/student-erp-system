import * as teacherController from '../controllers/teacher.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { teacherQuerySchema, upsertTeacherSchema } from '../validators/teacher.validator.js';

export default async function teacherRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Teachers'];
        });


        // List Teachers
        protectedRoutes.get('/', {
            preHandler: [requirePermission('view_teachers'), validate(teacherQuerySchema, 'query')]
        }, teacherController.getAllTeachers);

        // Create/Update Teacher Profile
        protectedRoutes.post('/', {
            preHandler: [requirePermission('manage_teachers'), validate(upsertTeacherSchema, 'body', { context: { isUpdate: false } })]
        }, teacherController.upsertTeacher);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_teachers'), validate(upsertTeacherSchema, 'body', { context: { isUpdate: true } })]
        }, teacherController.upsertTeacher);

        // CSV Export
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_teachers')
        }, teacherController.exportTeachers);

        // CSV Import
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_teachers')
        }, teacherController.importTeachers);

    }, { prefix: '/teachers' });
}
