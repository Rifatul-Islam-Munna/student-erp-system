import * as taskController from '../controllers/task.controller.js';
import { getAllTasksSwagger, createTaskSwagger, updateTaskSwagger } from '../schemas/task.schema.js';
import { createTaskSchema, updateTaskSchema, queryTaskSchema, updateTaskStatusSchema } from '../validators/task.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function taskRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Tasks'];
        });


        // List tasks
        protectedRoutes.get('/', {
            schema: getAllTasksSwagger,
            preHandler: [requirePermission('view_tasks'), validate(queryTaskSchema, 'query')]
        }, taskController.getAllTasks);

        // Get single task
        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_tasks')
        }, taskController.getTaskById);

        // Create task
        protectedRoutes.post('/', {
            schema: createTaskSwagger,
            preHandler: [requirePermission('manage_tasks'), validate(createTaskSchema, 'body')]
        }, taskController.createTask);

        // Update task details
        protectedRoutes.put('/:id', {
            schema: updateTaskSwagger,
            preHandler: [requirePermission('manage_tasks'), validate(updateTaskSchema, 'body')]
        }, taskController.updateTask);

        // Update task status only
        protectedRoutes.patch('/:id/status', {
            preHandler: [authenticate, validate(updateTaskStatusSchema, 'body')]
        }, taskController.updateTaskStatus);

        // Delete task
        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_tasks')
        }, taskController.deleteTask);

        // CSV Export
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_tasks')
        }, taskController.exportTasks);

        // CSV Import
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_tasks')
        }, taskController.importTasks);

    }, { prefix: '/tasks' });
}
