import * as eventController from '../controllers/event.controller.js';
import { getAllEventsSwagger, createEventSwagger } from '../schemas/event.schema.js';
import { createEventSchema, updateEventSchema, queryEventSchema } from '../validators/event.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function eventRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Events'];
        });


        // List events (Calendar View)
        protectedRoutes.get('/', {
            schema: getAllEventsSwagger,
            preHandler: [requirePermission('view_events'), validate(queryEventSchema, 'query')]
        }, eventController.getAllEvents);

        // Create event
        protectedRoutes.post('/', {
            schema: createEventSwagger,
            preHandler: [requirePermission('manage_events'), validate(createEventSchema, 'body')]
        }, eventController.createEvent);

        // Update event
        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_events'), validate(updateEventSchema, 'body')]
        }, eventController.updateEvent);

        // Delete event
        protectedRoutes.delete('/:id', {
            preHandler: requirePermission('manage_events')
        }, eventController.deleteEvent);

        // CSV Export
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_events')
        }, eventController.exportEvents);

        // CSV Import
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_events')
        }, eventController.importEvents);

    }, { prefix: '/events' });
}
