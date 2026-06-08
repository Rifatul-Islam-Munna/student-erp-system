import redis from '../config/redis.js';
import logger from './logger.service.js';

const DEFAULT_TTL = 300; // 5 minutes

export const getCache = async (key) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        logger.error(err, `Cache GET error for key: ${key}`);
        return null;
    }
};

export const setCache = async (key, value, ttl = DEFAULT_TTL) => {
    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
        logger.error(err, `Cache SET error for key: ${key}`);
    }
};

export const delCache = async (key) => {
    try {
        await redis.del(key);
    } catch (err) {
        logger.error(err, `Cache DEL error for key: ${key}`);
    }
};

export const initGlobalCache = async () => {
    try {
        if (redis.status === 'disabled') {
            logger.info('Redis is disabled, skipping cache initialization');
            return;
        }
        logger.info('Cache service initialized');
    } catch (err) {
        logger.error(err, 'Cache initialization error');
    }
};
