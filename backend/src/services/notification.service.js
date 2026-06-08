import MessageSetting from '../models/MessageSetting.js';
import Message from '../models/Message.js';
import logger from './logger.service.js';

/**
 * Automates sending Welcome Credentials to a newly created Entity (User, Student, Agency, Teacher).
 * Checks the Notification Toggles based on the creator's Role.
 *
 * @param {string} entityType - e.g., 'Student', 'Teacher', 'Agent', 'Branch', 'School'
 * @param {Object} entityData - Should contain details like email, phone, fullName
 * @param {string} rawPassword - The raw generated/provided password to send
 * @param {Object} creator - { _id, role, branch } The user who performed the creation action
 */
export const sendWelcomeCredentials = async (entityType, entityData, rawPassword, creator) => {
    try {
        let settings = await MessageSetting.findOne();
        if (!settings) {
            settings = await MessageSetting.create({}); // If no global settings exist, create with schema defaults
        }

        const roleConfig = settings.rolePermissions[creator.role];
        
        // If the role definition exists and is explicitly disabled, skip. Otherwise (e.g. system bot) allow.
        let canSendEmail = roleConfig ? roleConfig.emailEnabled : false;
        let canSendSms = roleConfig ? roleConfig.smsEnabled : false;

        const emailContent = `
Hello ${entityData.fullNameEn || entityData.fullName || entityData.name},

Your ${entityType} account has been successfully created. 
Below are your login credentials:

Email: ${entityData.email}
Password: ${rawPassword}

Please log in and update your password immediately.
Best regards,
System Admin
`.trim();

        const smsContent = `Your ${entityType} account is created. Email: ${entityData.email}, Pass: ${rawPassword}. Please login to update.`;

        // Dispatch Email if allowed and email exists
        if (canSendEmail && entityData.email) {
            let gatewayUsed = 'None';
            const defaultGateway = settings.emailGateways.find(g => g.isDefault);
            if (defaultGateway) gatewayUsed = defaultGateway.provider;

            // TODO: Here actual transporter like sendMail() could be called if integrated.
            // For now, simulated via database logic per requirements.

            await Message.create({
                messageType: 'email',
                recipientEmail: entityData.email,
                subject: `Welcome - Your ${entityType} Account Details`,
                content: emailContent,
                status: 'sent',
                gatewayUsed,
                senderRole: creator.role,
                sentBy: creator._id,
                branchId: creator.branch || null
            });
            logger.info(`System Auto-Email logged for new ${entityType}: ${entityData.email}`);
        }

        // Dispatch SMS if allowed and phone exists
        if (canSendSms && entityData.phone) {
            let gatewayUsed = 'None';
            const defaultGateway = settings.smsGateways.find(g => g.isDefault);
            if (defaultGateway) gatewayUsed = defaultGateway.provider;

            // TODO: Here actual SMS gateway could be called if integrated.

            await Message.create({
                messageType: 'sms',
                recipientPhone: entityData.phone,
                content: smsContent,
                status: 'sent',
                gatewayUsed,
                senderRole: creator.role,
                sentBy: creator._id,
                branchId: creator.branch || null
            });
            logger.info(`System Auto-SMS logged for new ${entityType}: ${entityData.phone}`);
        }

    } catch (error) {
        // We log the error but don't throw, so we don't break the creation process of the Parent Entity.
        logger.error(error, `Failed to send welcome credentials for ${entityType}`);
    }
};
