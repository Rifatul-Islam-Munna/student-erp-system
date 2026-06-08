export const notificationResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        recipient: { type: 'string' },
        type: { type: 'string' },
        title: { type: 'string' },
        body: { type: 'string' },
        link: { type: ['string', 'null'] },
        isRead: { type: 'boolean' },
        readAt: { type: ['string', 'null'], format: 'date-time' },
        priority: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
    }
};

export const getMyNotificationsSwagger = {
    tags: ['Notifications'],
    description: 'Get current user\'s notifications with pagination, filtering by type, read status, and date range',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 20 },
            type: { type: 'string' },
            isRead: { type: 'string' },
            priority: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
        }
    }
};

export const getUnreadCountSwagger = {
    tags: ['Notifications'],
    description: 'Get unread notification count for badge display',
    security: [{ bearerAuth: [] }]
};

export const markAsReadSwagger = {
    tags: ['Notifications'],
    description: 'Mark a single notification as read',
    security: [{ bearerAuth: [] }]
};

export const markAllAsReadSwagger = {
    tags: ['Notifications'],
    description: 'Mark all unread notifications as read',
    security: [{ bearerAuth: [] }]
};

export const sendNotificationSwagger = {
    tags: ['Notifications'],
    description: 'Admin: Send notification to specific user(s)',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['recipients', 'title', 'body'],
        properties: {
            recipients: { type: 'array', items: { type: 'string' } },
            type: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            link: { type: 'string' },
            priority: { type: 'string' }
        }
    }
};

export const broadcastNotificationSwagger = {
    tags: ['Notifications'],
    description: 'Admin: Broadcast notification to all users or by role filter',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['title', 'body'],
        properties: {
            roles: { type: 'array', items: { type: 'string' } },
            type: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            link: { type: 'string' },
            priority: { type: 'string' }
        }
    }
};

export const getPreferencesSwagger = {
    tags: ['Notifications'],
    description: 'Get current user\'s notification preferences',
    security: [{ bearerAuth: [] }]
};

export const updatePreferencesSwagger = {
    tags: ['Notifications'],
    description: 'Update current user\'s notification preferences',
    security: [{ bearerAuth: [] }]
};
