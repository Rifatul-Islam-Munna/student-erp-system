import * as notificationController from '../controllers/notification.controller.js';
import { getMyNotificationsSwagger, getUnreadCountSwagger, markAsReadSwagger, markAllAsReadSwagger, sendNotificationSwagger, broadcastNotificationSwagger, getPreferencesSwagger, updatePreferencesSwagger } from '../schemas/notification.schema.js';
import { queryNotificationSchema, sendNotificationSchema, broadcastNotificationSchema, updatePreferencesSchema } from '../validators/notification.validator.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function notificationRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Notifications'];
        });

        // Get my notifications
        protectedRoutes.get('/', {
            schema: getMyNotificationsSwagger,
            preHandler: validate(queryNotificationSchema, 'query')
        }, notificationController.getMyNotifications);

        // Get unread count
        protectedRoutes.get('/unread-count', {
            schema: getUnreadCountSwagger
        }, notificationController.getUnreadCount);

        // Get preferences
        protectedRoutes.get('/preferences', {
            schema: getPreferencesSwagger
        }, notificationController.getPreferences);

        // Update preferences
        protectedRoutes.put('/preferences', {
            schema: updatePreferencesSwagger,
            preHandler: validate(updatePreferencesSchema, 'body')
        }, notificationController.updatePreferences);

        // Mark all as read
        protectedRoutes.patch('/mark-all-read', {
            schema: markAllAsReadSwagger
        }, notificationController.markAllAsRead);

        // Mark single as read
        protectedRoutes.patch('/:id/read', {
            schema: markAsReadSwagger
        }, notificationController.markAsRead);

        // Delete notification
        protectedRoutes.delete('/:id', {}, notificationController.deleteNotification);

        // Clear all
        protectedRoutes.delete('/clear-all', {}, notificationController.clearAll);

        // Admin: Send notifications
        protectedRoutes.post('/send', {
            schema: sendNotificationSwagger,
            preHandler: [requirePermission('manage_notifications'), validate(sendNotificationSchema, 'body')]
        }, notificationController.sendNotification);

        // Admin: Broadcast
        protectedRoutes.post('/broadcast', {
            schema: broadcastNotificationSwagger,
            preHandler: [authorize(['super_admin', 'admin']), validate(broadcastNotificationSchema, 'body')]
        }, notificationController.broadcastNotification);

    }, { prefix: '/notifications' });
}
