import * as studentController from '../controllers/student.controller.js';
import {
    getAllStudentsSwagger,
    createStudentSwagger,
    getStudentStatsSwagger
} from '../schemas/student.schema.js';
import {
    createStudentSchema,
    updateStudentSchema,
    queryStudentSchema
} from '../validators/student.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function studentRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Students'];
        });

        
        protectedRoutes.get('/stats', {
            schema: getStudentStatsSwagger,
            preHandler: requirePermission('view_students')
        }, studentController.getStudentStats);

        protectedRoutes.get('/', {
            schema: getAllStudentsSwagger,
            preHandler: [requirePermission('view_students'), validate(queryStudentSchema, 'query')]
        }, studentController.getAllStudents);
        
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_students')
        }, studentController.exportStudents);
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_students')
        }, studentController.importStudents);

        protectedRoutes.get('/search', {
            preHandler: requirePermission('view_students')
        }, studentController.searchStudents);
        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_students')
        }, studentController.getStudentById);

        protectedRoutes.post('/', {
            schema: createStudentSwagger,
            preHandler: [requirePermission('manage_students'), validate(createStudentSchema, 'body')]
        }, studentController.createStudent);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_students'), validate(updateStudentSchema, 'body')]
        }, studentController.updateStudent);

        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_students')
        }, studentController.deleteStudent);

    }, { prefix: '/students' });
}
