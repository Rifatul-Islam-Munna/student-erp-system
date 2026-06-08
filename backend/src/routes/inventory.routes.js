import * as inventoryController from '../controllers/inventory.controller.js';
import { getAllItemsSwagger, createItemSwagger, updateStockSwagger } from '../schemas/inventory.schema.js';
import { createInventoryItemSchema, updateStockSchema, queryInventorySchema } from '../validators/inventory.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function inventoryRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Dashboard'];
        });


        // List items
        protectedRoutes.get('/items', {
            schema: getAllItemsSwagger,
            preHandler: [requirePermission('view_inventory'), validate(queryInventorySchema, 'query')]
        }, inventoryController.getAllItems);

        // Create item
        protectedRoutes.post('/items', {
            schema: createItemSwagger,
            preHandler: [requirePermission('manage_inventory'), validate(createInventoryItemSchema, 'body')]
        }, inventoryController.createItem);

        // Update stock (Transactional)
        protectedRoutes.post('/items/:id/stock', {
            schema: updateStockSwagger,
            preHandler: [requirePermission('manage_inventory'), validate(updateStockSchema, 'body')]
        }, inventoryController.updateStock);

        // List logs
        protectedRoutes.get('/logs', {
            preHandler: requirePermission('view_inventory')
        }, inventoryController.getInventoryLogs);

        // CSV Export
        protectedRoutes.get('/export', {
            preHandler: requirePermission('view_inventory')
        }, inventoryController.exportInventory);

        // CSV Import
        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_inventory')
        }, inventoryController.importInventory);

    }, { prefix: '/inventory' });
}
