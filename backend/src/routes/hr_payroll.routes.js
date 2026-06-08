import * as hrController from '../controllers/hr_payroll.controller.js';
import { getAllEmployeesSwagger, generatePayrollSwagger } from '../schemas/hr_payroll.schema.js';
import { 
    createEmployeeProfileSchema, 
    updateSalaryStructureSchema, 
    markAttendanceSchema, 
    generatePayrollSchema, 
    processPaymentSchema,
    queryHRSchema
} from '../validators/hr_payroll.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function hrRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['HR Payroll'];
        });


        // --- HR Profiles ---
        protectedRoutes.get('/employees', {
            schema: getAllEmployeesSwagger,
            preHandler: [requirePermission('view_hr'), validate(queryHRSchema, 'query')]
        }, hrController.getAllEmployees);

        protectedRoutes.post('/employees', {
            preHandler: [requirePermission('manage_hr'), validate(createEmployeeProfileSchema, 'body')]
        }, hrController.upsertEmployeeProfile);

        protectedRoutes.put('/employees/:userId/salary-structure', {
            preHandler: [requirePermission('manage_hr'), validate(updateSalaryStructureSchema, 'body')]
        }, hrController.updateSalaryStructure);

        // --- Staff Attendance ---
        protectedRoutes.get('/attendance', {
            preHandler: requirePermission('view_staff_attendance')
        }, hrController.getStaffAttendance);

        protectedRoutes.post('/attendance', {
            preHandler: [requirePermission('manage_staff_attendance'), validate(markAttendanceSchema, 'body')]
        }, hrController.markAttendance);

        // --- Payroll ---
        protectedRoutes.get('/payroll', {
            preHandler: requirePermission('view_payroll')
        }, hrController.getPayrollRecords);

        protectedRoutes.post('/payroll/generate', {
            schema: generatePayrollSwagger,
            preHandler: [requirePermission('manage_payroll'), validate(generatePayrollSchema, 'body')]
        }, hrController.generateMonthlyPayroll);

        protectedRoutes.post('/payroll/:id/pay', {
            preHandler: [requirePermission('manage_payroll'), validate(processPaymentSchema, 'body')]
        }, hrController.processPayment);

        protectedRoutes.get('/payroll/export', {
            preHandler: requirePermission('view_payroll')
        }, hrController.exportPayroll);

        // --- Data Exchange ---
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_hr')
        }, hrController.importEmployeeData);

    }, { prefix: '/hr' });
}
