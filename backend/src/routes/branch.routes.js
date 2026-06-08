import * as branchController from '../controllers/branch.controller.js';
import {
    getBranchesSwagger,
    createBranchSwagger,
    updateBranchSwagger,
    deleteBranchSwagger
} from '../schemas/branch.schema.js';
import {
    createBranchSchema,
    updateBranchSchema
} from '../validators/branch.validator.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function branchRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Branches'];
        });


        // All authenticated users can view branches for dropdowns etc.
        // But only super_admin and admin can manage them.
        protectedRoutes.get('/', {
            schema: getBranchesSwagger,
            preHandler: requirePermission('view_branches')
        }, branchController.getBranches);

        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_branches')
        }, branchController.getBranchById);

        // Protected CRUD
        protectedRoutes.post('/', {
            schema: createBranchSwagger,
            preHandler: [requirePermission('manage_branches'), validate(createBranchSchema)]
        }, branchController.createBranch);

        protectedRoutes.put('/:id', {
            schema: updateBranchSwagger,
            preHandler: [requirePermission('manage_branches'), validate(updateBranchSchema)]
        }, branchController.updateBranch);

        protectedRoutes.delete('/:id', {
            schema: deleteBranchSwagger,
            preHandler: requirePermission('manage_branches')
        }, branchController.deleteBranch);

    }, { prefix: '/branches' });
}
