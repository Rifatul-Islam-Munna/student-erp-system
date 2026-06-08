import * as attendanceController from '../controllers/attendance.controller.js';
import {
    getAllAttendanceSwagger,
    bulkUpdateAttendanceSwagger
} from '../schemas/attendance.schema.js';
import {
    queryAttendanceSchema,
    bulkUpdateAttendanceSchema
} from '../validators/attendance.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function attendanceRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Attendance'];
        });

        
        protectedRoutes.get('/', {
            schema: getAllAttendanceSwagger,
            preHandler: [requirePermission('view_attendance'), validate(queryAttendanceSchema, 'query')]
        }, attendanceController.getAllAttendance);

        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_attendance')
        }, attendanceController.exportAttendance);

        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_attendance')
        }, attendanceController.importAttendance);

        protectedRoutes.post('/bulk', {
            schema: bulkUpdateAttendanceSwagger,
            preHandler: [requirePermission('manage_attendance'), validate(bulkUpdateAttendanceSchema, 'body')]
        }, attendanceController.bulkUpdateAttendance);

    }, { prefix: '/attendance' });
}
