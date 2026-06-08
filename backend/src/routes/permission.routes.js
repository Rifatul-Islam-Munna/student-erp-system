import * as permissionController from '../controllers/permission.controller.js';
import {
    getPermissionsSwagger,
    createPermissionSwagger,
    updatePermissionSwagger,
    deletePermissionSwagger
} from '../schemas/permission.schema.js';
import {
    createPermissionSchema,
    updatePermissionSchema
} from '../validators/permission.validator.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function permissionRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        // Must be authenticated and mapped only to super internal administrators
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Permissions'];
        });

        protectedRoutes.addHook('onRequest', authorize(['super_admin', 'admin']));

        protectedRoutes.get('/', {
            schema: getPermissionsSwagger
        }, permissionController.getPermissions);

        protectedRoutes.get('/keys', {}, permissionController.getAllPermissionKeys);

        protectedRoutes.get('/:id', {
            // Reusing get permissions swagger doc pattern logic loosely or omitting explicitly
        }, permissionController.getPermissionById);

        protectedRoutes.post('/', {
            schema: createPermissionSwagger,
            preHandler: validate(createPermissionSchema)
        }, permissionController.createPermission);

        protectedRoutes.put('/:id', {
            schema: updatePermissionSwagger,
            preHandler: validate(updatePermissionSchema)
        }, permissionController.updatePermission);

        protectedRoutes.delete('/:id', {
            schema: deletePermissionSwagger
        }, permissionController.deletePermission);

    }, { prefix: '/permissions' });
}
