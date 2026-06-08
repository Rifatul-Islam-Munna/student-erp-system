import Notification from '../models/Notification.js';
import NotificationPreference from '../models/NotificationPreference.js';
import logger from '../services/logger.service.js';

/**
 * GET /notifications
 * Get current user's notifications with filters.
 */
export const getMyNotifications = async (request, reply) => {
    try {
        const { page = 1, limit = 20, type, isRead, priority, startDate, endDate } = request.query;
        const query = { recipient: request.user._id };

        if (type) query.type = type;
        if (isRead !== undefined) query.isRead = isRead === 'true' || isRead === true;
        if (priority) query.priority = priority;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Notification.countDocuments(query),
            Notification.countDocuments({ recipient: request.user._id, isRead: false })
        ]);

        return reply.code(200).send({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch notifications.' });
    }
};

/**
 * GET /notifications/unread-count
 * Quick endpoint to get unread count for badge display.
 */
export const getUnreadCount = async (request, reply) => {
    try {
        const count = await Notification.countDocuments({ recipient: request.user._id, isRead: false });
        return reply.send({ success: true, data: { unreadCount: count } });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch unread count.' });
    }
};

/**
 * PATCH /notifications/:id/read
 * Mark a single notification as read.
 */
export const markAsRead = async (request, reply) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: request.params.id, recipient: request.user._id },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        if (!notification) return reply.code(404).send({ success: false, message: 'Notification not found.' });
        return reply.send({ success: true, message: 'Notification marked as read.', data: notification });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to mark notification as read.' });
    }
};

/**
 * PATCH /notifications/mark-all-read
 * Mark all unread notifications as read.
 */
export const markAllAsRead = async (request, reply) => {
    try {
        const result = await Notification.updateMany(
            { recipient: request.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        return reply.send({ success: true, message: `Marked ${result.modifiedCount} notifications as read.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to mark all as read.' });
    }
};

/**
 * DELETE /notifications/:id
 * Delete a single notification.
 */
export const deleteNotification = async (request, reply) => {
    try {
        const notification = await Notification.findOneAndDelete({ _id: request.params.id, recipient: request.user._id });
        if (!notification) return reply.code(404).send({ success: false, message: 'Notification not found.' });
        return reply.send({ success: true, message: 'Notification deleted.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete notification.' });
    }
};

/**
 * DELETE /notifications/clear-all
 * Clear all notifications for the current user.
 */
export const clearAll = async (request, reply) => {
    try {
        const result = await Notification.deleteMany({ recipient: request.user._id });
        return reply.send({ success: true, message: `Cleared ${result.deletedCount} notifications.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to clear notifications.' });
    }
};

/**
 * POST /notifications/send
 * Admin: Send a notification to specific user(s).
 */
export const sendNotification = async (request, reply) => {
    try {
        const { recipients, type, title, body, link, priority } = request.body;
        const notifications = recipients.map(recipientId => ({
            recipient: recipientId,
            type: type || 'announcement',
            title,
            body,
            link: link || null,
            priority: priority || 'medium',
            branch: request.user.branch || null
        }));

        const created = await Notification.insertMany(notifications);
        return reply.code(201).send({ success: true, message: `Sent ${created.length} notifications.`, data: { count: created.length } });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to send notifications.' });
    }
};

/**
 * POST /notifications/broadcast
 * Admin: Broadcast to all users or by role.
 */
export const broadcastNotification = async (request, reply) => {
    try {
        const { roles, title, body, link, priority, type } = request.body;
        const User = (await import('../models/User.js')).default;

        const userQuery = { accountStatus: 'active' };
        if (roles && roles.length > 0) userQuery.role = { $in: roles };

        const users = await User.find(userQuery).select('_id').lean();
        const notifications = users.map(u => ({
            recipient: u._id,
            type: type || 'announcement',
            title,
            body,
            link: link || null,
            priority: priority || 'medium'
        }));

        const created = await Notification.insertMany(notifications);
        return reply.code(201).send({ success: true, message: `Broadcast to ${created.length} users.`, data: { count: created.length } });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to broadcast notification.' });
    }
};

// --- Notification Preferences ---

/**
 * GET /notifications/preferences
 * Get current user's notification preferences.
 */
export const getPreferences = async (request, reply) => {
    try {
        let prefs = await NotificationPreference.findOne({ user: request.user._id });
        if (!prefs) {
            prefs = await NotificationPreference.create({ user: request.user._id });
        }
        return reply.send({ success: true, data: prefs });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch preferences.' });
    }
};

/**
 * PUT /notifications/preferences
 * Update current user's notification preferences.
 */
export const updatePreferences = async (request, reply) => {
    try {
        const prefs = await NotificationPreference.findOneAndUpdate(
            { user: request.user._id },
            request.body,
            { new: true, upsert: true }
        );
        return reply.send({ success: true, message: 'Preferences updated.', data: prefs });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update preferences.' });
    }
};
