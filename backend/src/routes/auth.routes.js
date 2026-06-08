import * as authController from '../controllers/auth.controller.js';
import {
    registerSwagger,
    loginSwagger,
    forgotPasswordSwagger,
    resetPasswordSwagger,
    getMeSwagger,
    changePasswordSwagger
} from '../schemas/auth.schema.js';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

export default async function authRoutes(fastify, options) {

    // Public Auth Routes
    fastify.register(async (publicRoutes) => {

        publicRoutes.post('/register', {
            schema: registerSwagger,
            preHandler: validate(registerSchema)
        }, authController.register);

        publicRoutes.post('/login', {
            schema: loginSwagger,
            preHandler: validate(loginSchema),
            config: {
                rateLimit: {
                    max: 10,
                    timeWindow: '5 minutes'
                }
            }
        }, authController.login);

        publicRoutes.post('/forgot-password', {
            schema: forgotPasswordSwagger,
            preHandler: validate(forgotPasswordSchema),
            config: {
                rateLimit: {
                    max: 3,
                    timeWindow: '10 minutes'
                }
            }
        }, authController.forgotPassword);

        publicRoutes.post('/reset-password', {
            schema: resetPasswordSwagger,
            preHandler: validate(resetPasswordSchema)
        }, authController.resetPassword);

    }, { prefix: '/auth' });

    // Protected Auth Routes
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.addHook('onRoute', (routeOptions) => {
            routeOptions.schema = routeOptions.schema || {};
            routeOptions.schema.tags = routeOptions.schema.tags || ['Auth'];
        });


        protectedRoutes.get('/me', {
            schema: getMeSwagger
        }, authController.getMe);

        protectedRoutes.post('/change-password', {
            schema: changePasswordSwagger,
            preHandler: validate(changePasswordSchema)
        }, authController.changePassword);

    }, { prefix: '/auth' });
}
