import * as partnerAgencyController from '../controllers/partner_agency.controller.js';
import { getAllPartnerAgenciesSwagger, createPartnerAgencySwagger } from '../schemas/partner_agency.schema.js';
import { 
    createPartnerAgencySchema, 
    updatePartnerAgencySchema, 
    queryPartnerAgencySchema
} from '../validators/partner_agency.validator.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function partnerAgencyRoutes(fastify, options) {
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Partner Agencies'];
        });


        protectedRoutes.get('/', {
            schema: getAllPartnerAgenciesSwagger,
            preHandler: [requirePermission('view_partner_agencies'), validate(queryPartnerAgencySchema, 'query')]
        }, partnerAgencyController.getAllAgencies);

        protectedRoutes.get('/:id', {
            preHandler: [requirePermission('view_partner_agencies')]
        }, partnerAgencyController.getAgencyById);

        protectedRoutes.post('/', {
            schema: createPartnerAgencySwagger,
            preHandler: [requirePermission('manage_partner_agencies'), validate(createPartnerAgencySchema, 'body')]
        }, partnerAgencyController.createAgency);

        protectedRoutes.put('/:id', {
            preHandler: [requirePermission('manage_partner_agencies'), validate(updatePartnerAgencySchema, 'body')]
        }, partnerAgencyController.updateAgency);

        protectedRoutes.delete('/:id', {
            preHandler: [requirePermission('manage_partner_agencies')]
        }, partnerAgencyController.deleteAgency);

        protectedRoutes.get('/export', {
            preHandler: requirePermission('export_partner_agencies')
        }, partnerAgencyController.exportAgencies);

        protectedRoutes.post('/import', {
            preHandler: requirePermission('manage_partner_agencies')
        }, partnerAgencyController.importAgencies);

    }, { prefix: '/partner-agencies' });
}
