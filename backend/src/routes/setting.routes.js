import * as settingController from '../controllers/setting.controller.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { updateSettingSchema } from '../validators/setting.validator.js';

export default async function settingRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Settings'];
        });


        // Fetch settings - available to all authenticated users for dropdowns
        protectedRoutes.get('/', {
            preHandler: requirePermission('view_settings')
        }, settingController.getSettings);

        // Update settings - super_admin and admin only
        protectedRoutes.patch('/', {
            preHandler: [requirePermission('manage_settings'), validate(updateSettingSchema)]
        }, settingController.updateSettings);

    }, { prefix: '/settings' });
}
