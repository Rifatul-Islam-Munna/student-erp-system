import { getCache, setCache } from './cache.service.js';
import logger from './logger.service.js';

const SETTINGS_CACHE_KEY = 'app:settings';
const SETTINGS_TTL = 600; // 10 minutes

export const getSettings = async () => {
    try {
        const cached = await getCache(SETTINGS_CACHE_KEY);
        if (cached) return cached;

        const Setting = (await import('../models/Setting.js')).default;
        const settings = await Setting.findOne();

        if (settings) {
            await setCache(SETTINGS_CACHE_KEY, settings, SETTINGS_TTL);
        }

        return settings;
    } catch (err) {
        logger.error(err, 'Error fetching settings');
        return null;
    }
};

export const clearSettingsCache = async () => {
    const { delCache } = await import('./cache.service.js');
    await delCache(SETTINGS_CACHE_KEY);
};
