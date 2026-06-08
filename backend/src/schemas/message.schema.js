export const createMessageSwagger = {
    description: 'Create and send a new message',
    tags: ['Messages'],
    summary: 'Create and optionally send a message',
    body: {
        type: 'object',
        required: ['messageType', 'content'],
        properties: {
            messageType: { type: 'string', enum: ['email', 'sms'] },
            recipientEmail: { type: 'string', format: 'email' },
            recipientPhone: { type: 'string' },
            subject: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'sent', 'failed', 'draft'] }
        }
    },
    response: {
        201: {
            description: 'Message created successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' }
            }
        }
    }
};

export const updateMessageSwagger = {
    description: 'Update a draft message',
    tags: ['Messages'],
    summary: 'Update a message',
    body: {
        type: 'object',
        properties: {
            subject: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'sent', 'failed', 'draft'] }
        }
    }
};

export const getAllMessagesSwagger = {
    description: 'Get all messages with pagination and filters',
    tags: ['Messages'],
    summary: 'List messages',
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            messageType: { type: 'string' },
            status: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            keyword: { type: 'string' }
        }
    }
};

export const updateMessageSettingSwagger = {
    description: 'Update message settings including gateways',
    tags: ['Message Settings'],
    summary: 'Update global message settings'
};

export const getMessageSettingSwagger = {
    description: 'Get global message settings',
    tags: ['Message Settings'],
    summary: 'Get settings'
};
