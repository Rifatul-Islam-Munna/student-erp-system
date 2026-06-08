import * as messageController from '../controllers/message.controller.js';
import * as messageSettingController from '../controllers/message_setting.controller.js';
import {
    createMessageSwagger,
    updateMessageSwagger,
    getAllMessagesSwagger,
    getMessageSettingSwagger,
    updateMessageSettingSwagger
} from '../schemas/message.schema.js';
import {
    createMessageSchema,
    updateMessageSchema,
    queryMessageSchema,
    messageSettingSchema
} from '../validators/message.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function messageRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Messages'];
        });


        // --- Message Settings Routes ---
        
        protectedRoutes.get('/settings', {
            schema: getMessageSettingSwagger,
            preHandler: requirePermission('manage_message_settings')
        }, messageSettingController.getMessageSettings);

        protectedRoutes.put('/settings', {
            schema: updateMessageSettingSwagger,
            preHandler: [requirePermission('manage_message_settings'), validate(messageSettingSchema, 'body')]
        }, messageSettingController.updateMessageSettings);


        // --- Messages CRUD Routes ---

        // List messages
        protectedRoutes.get('/', {
            schema: getAllMessagesSwagger,
            preHandler: [requirePermission('view_messages'), validate(queryMessageSchema, 'query')]
        }, messageController.getAllMessages);

        // Get single message
        protectedRoutes.get('/:id', {
            preHandler: requirePermission('view_messages')
        }, messageController.getMessageById);

        // Send a message
        protectedRoutes.post('/', {
            schema: createMessageSwagger,
            preHandler: [requirePermission('manage_messages'), validate(createMessageSchema, 'body')]
        }, messageController.createMessage);

        // Update a draft message
        protectedRoutes.put('/:id', {
            schema: updateMessageSwagger,
            preHandler: [requirePermission('manage_messages'), validate(updateMessageSchema, 'body')]
        }, messageController.updateMessage);

        // Delete message log
        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_messages')
        }, messageController.deleteMessage);

        // Export messages
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_messages')
        }, messageController.exportMessages);

        // Import messages
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_messages')
        }, messageController.importMessages);

    }, { prefix: '/messages' });
}
