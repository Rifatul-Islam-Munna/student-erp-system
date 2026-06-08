import * as userController from '../controllers/user.controller.js';
import { getAllUsersSwagger, createUserSwagger } from '../schemas/user.schema.js';
import { queryUserSchema, createUserSchema, updateUserSchema } from '../validators/user.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function userRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Users'];
        });


        // List all users
        protectedRoutes.get('/', {
            schema: getAllUsersSwagger,
            preHandler: [requirePermission('view_users'), validate(queryUserSchema, 'query')]
        }, userController.getAllUsers);

        // Dropdown helpers (active agents / counselors only)
        protectedRoutes.get('/agents', {
            preHandler: requirePermission('view_users')
        }, userController.getAgents);

        protectedRoutes.get('/counselors', {
            preHandler: requirePermission('view_users')
        }, userController.getCounselors);

        protectedRoutes.get('/branches', {
            preHandler: requirePermission('view_users')
        }, userController.getBranchUsers);

        protectedRoutes.get('/task-targets', {
            preHandler: requirePermission('view_tasks')
        }, userController.searchTaskTargets);

        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_users')
        }, userController.exportUsers);

        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_users')
        }, userController.importUsers);

        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_users')
        }, userController.getUserById);

        protectedRoutes.post('/', {
            schema: createUserSwagger,
            preHandler: [requirePermission('manage_users'), validate(createUserSchema, 'body')]
        }, userController.createUser);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_users'), validate(updateUserSchema, 'body')]
        }, userController.updateUser);

        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_users')
        }, userController.deleteUser);

    }, { prefix: '/users' });
}
