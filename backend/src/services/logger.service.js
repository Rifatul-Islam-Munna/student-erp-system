import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

const logger = pino({
    level: isDev ? 'debug' : 'info',
    transport: isDev ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined
});

export const logError = async (data) => {
    const errorData = typeof data === 'string' ? { message: data } : data;

    const payload = {
        type: errorData.type || 'application',
        message: errorData.message || 'Unknown Error',
        stack: errorData.stack,
        file: errorData.file,
        method: errorData.method,
        path: errorData.path,
        userId: errorData.userId,
        meta: errorData.meta,
    };

    logger.error(payload, `Error: ${payload.message}`);

    (async () => {
        try {
            const ErrorLog = (await import('../models/ErrorLog.js')).default;
            await ErrorLog.create(payload);
        } catch (err) {
            if (isDev) console.error('Failed to persist error log:', err.message);
        }
    })();
};

export default logger;
