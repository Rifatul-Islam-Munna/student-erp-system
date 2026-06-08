import Redis from 'ioredis';
import logger from '../services/logger.service.js';

const isRedisEnabled = process.env.REDIS_ENABLED === 'true';

let redis;

if (isRedisEnabled) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 1
    });

    redis.on('connect', () => logger.debug('Redis Connected'));
    redis.on('error', (err) => logger.error(err, 'Redis Connection Error'));
} else {
    redis = {
        get: async () => null,
        set: async () => 'OK',
        del: async () => 0,
        on: () => { },
        status: 'disabled'
    };
}

export default redis;
