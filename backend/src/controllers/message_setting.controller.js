import MessageSetting from '../models/MessageSetting.js';
import logger from '../services/logger.service.js';

/**
 * Get current message settings. If none exist, create a default one.
 */
export const getMessageSettings = async (request, reply) => {
    try {
        let settings = await MessageSetting.findOne();
        if (!settings) {
            settings = await MessageSetting.create({}); // creates default based on schema defaults
        }

        return reply.code(200).send({
            success: true,
            data: settings
        });
    } catch (error) {
        throw new ErrorHandler(500, error.message);
    }
};

/**
 * Update message settings
 */
export const updateMessageSettings = async (request, reply) => {
    try {
        let settings = await MessageSetting.findOne();
        if (!settings) {
            settings = new MessageSetting();
        }

        if (request.body.rolePermissions) {
            settings.rolePermissions = request.body.rolePermissions;
        }

        // We can completely overwrite gateways or append them based on body structure
        // For simplicity, we overwrite the whole array
        if (request.body.emailGateways) {
            settings.emailGateways = request.body.emailGateways;
        }
        if (request.body.smsGateways) {
            settings.smsGateways = request.body.smsGateways;
        }

        await settings.save();

        return reply.code(200).send({
            success: true,
            message: 'Message settings updated successfully',
            data: settings
        });
    } catch (error) {
        throw new ErrorHandler(500, error.message);
    }
};
