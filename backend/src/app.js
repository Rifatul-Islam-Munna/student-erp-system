import 'dotenv/config';
import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import autoload from '@fastify/autoload';
import connectDB from './config/db.js';
import { swaggerConfig, swaggerUiConfig } from './config/swagger.js';
import logger from './services/logger.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'production' ? true : false,
    ajv: {
        customOptions: {
            allowUnionTypes: true
        }
    }
});

fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET
});

fastify.register(import('@fastify/swagger'), swaggerConfig);
if (process.env.NODE_ENV === 'development') {
    fastify.register(import('@fastify/swagger-ui'), swaggerUiConfig);
}

fastify.register(import('@fastify/static'), {
    root: path.join(__dirname, '../public'),
    prefix: '/public/',
});

fastify.register(import('@fastify/multipart'), {
    addToBody: false,
    limits: {
        fieldNameSize: 100,
        fieldSize: 100,
        fields: 10,
        fileSize: 10485760,
        files: 3,
        headerPairs: 2000
    }
});

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '*')
    .split(',')
    .map(origin => origin.trim());

fastify.register(import('@fastify/cors'), {
    origin: (origin, cb) => {
        if (!origin || process.env.NODE_ENV === 'development') return cb(null, true);

        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return cb(null, true);
        }
        logger.warn(`CORS rejected origin: ${origin}`);
        return cb(new Error("Not allowed by CORS"));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token',
        'X-Forwarded-For',
        'X-Forwarded-Host',
        'X-Forwarded-Proto',
        'X-Forwarded-Port'
    ]
});

fastify.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "validator.swagger.io"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    xFrameOptions: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    hidePoweredBy: true,
    xssFilter: true,
});

fastify.register(import('@fastify/cookie'), {
    secret: process.env.COOKIE_SECRET || 'supersecret-cookie-secret-min-32-chars-long',
    parseOptions: {}
});

fastify.register(import('@fastify/request-context'), {
    hook: 'onRequest',
    defaultStoreValues: (request) => ({
        requestId: request.id,
        ip: request.headers['x-forwarded-for'] || request.ip || request.socket.remoteAddress,
        user: null
    })
});

fastify.register(import('@fastify/rate-limit'), {
    max: 10000,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1', '::1'],
    keyGenerator: (request) => {
        return request.headers['x-forwarded-for'] || request.ip || request.socket.remoteAddress;
    },
    errorResponseBuilder: (request, context) => {
        return {
            statusCode: 429,
            error: 'Too Many Requests',
            message: `Rate limit exceeded, retry in ${context.after} seconds`
        };
    }
});

// Auto-load plugins
fastify.register(autoload, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, process.env)
});

// Auto-load routes
fastify.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    options: { prefix: '/api/v1' },
    ignorePattern: /.*\.test\.js/
});

fastify.get('/', async (request, reply) => {
    return { status: 'ok', message: 'AgencyBook Backend is running' };
});

fastify.get('/favicon.ico', async (req, reply) => {
    reply.code(404).send();
});

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    try {
        await fastify.close();
        logger.info('Fastify server closed');

        await mongoose.connection.close();
        logger.info('MongoDB connection closed');

        logger.info('Graceful shutdown completed. Exiting.');
        process.exit(0);
    } catch (err) {
        logger.error(err, 'Error during graceful shutdown');
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

const start = async () => {
    try {
        await connectDB();

        const { logError } = await import('./services/logger.service.js');

        fastify.setErrorHandler(async (error, request, reply) => {
            const statusCode = error.statusCode || 500;
            if (statusCode >= 500) {
                await logError({
                    type: 'application',
                    message: error.message,
                    stack: error.stack,
                    method: request.method,
                    path: request.url,
                    userId: request.user?.id,
                    file: 'app.js (Global Handler)'
                });
            } else {
                request.log.warn({
                    msg: error.message,
                    path: request.url,
                    method: request.method,
                    statusCode: statusCode
                });
            }

            if (error.validation) {
                return reply.code(400).send({ message: error.message, details: error.validation });
            }

            if (reply.statusCode >= 500) {
                request.log.error(error);
                return reply.code(500).send({ message: 'Internal Server Error' });
            }

            return reply.send(error);
        });

        const { initGlobalCache } = await import('./services/cache.service.js');
        await initGlobalCache();

        await fastify.ready();

        await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
        fastify.log.info(`Swagger documentation available at http://localhost:${process.env.PORT || 3000}/documentation`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

export { fastify, start };

if (process.env.NODE_ENV !== 'test') {
    (async () => {
        try {
            await connectDB();
            (await import('./seeders/admin.seeder.js')).default();
            (await import('./seeders/setting.seeder.js')).default();

            const { initGlobalCache } = await import('./services/cache.service.js');
            await initGlobalCache();

            start();
        } catch (e) {
            logger.error(e);
            process.exit(1);
        }
    })();
}
