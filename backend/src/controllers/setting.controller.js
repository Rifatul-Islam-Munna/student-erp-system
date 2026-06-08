import Setting from '../models/Setting.js';
import logger from '../services/logger.service.js';

/**
 * Get the global settings document.
 * Creates one if none exists.
 */
export const getSettings = async (request, reply) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }
        return reply.code(200).send({
            success: true,
            data: settings
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({
            success: true,
            message: 'Failed to fetch settings'
        });
    }
};

/**
 * Update global settings.
 */
export const updateSettings = async (request, reply) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create(request.body);
        } else {
            settings = await Setting.findByIdAndUpdate(
                settings._id,
                { $set: request.body },
                { new: true, runValidators: true }
            );
        }

        return reply.code(200).send({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({
            success: false,
            message: 'Failed to update settings'
        });
    }
};
