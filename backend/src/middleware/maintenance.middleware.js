import { getSettings } from '../services/setting.service.js';

const maintenanceMiddleware = async (request, reply) => {
    try {
        const settings = await getSettings();

        if (settings && settings.site && settings.site.maintenance_mode) {
            if (request.url.includes('/admin/auth') ||
                request.url.includes('/documentation') ||
                request.url.includes('/settings/public')) {
                return;
            }

            return reply.code(503).send({
                message: settings.site.maintenance_message || 'System under maintenance',
                maintenance_mode: true
            });
        }
    } catch (err) {
        request.log.error(err);
    }
};

export default maintenanceMiddleware;
