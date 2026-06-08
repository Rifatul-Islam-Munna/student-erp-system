import Message from '../models/Message.js';
import MessageSetting from '../models/MessageSetting.js';
import logger from '../services/logger.service.js';
import { stringify } from 'csv-stringify';
import { parse } from 'csv-parse';
import stream from 'stream';

export const createMessage = async (request, reply) => {
    try {
        const { messageType, recipientEmail, recipientPhone, subject, content, status } = request.body;
        const senderRole = request.user.role; // Assuming user role is attached via auth

        // 1. Fetch settings to check if sending is enabled for this role
        let settings = await MessageSetting.findOne();
        if (!settings) settings = new MessageSetting();

        const roleConfig = settings.rolePermissions[senderRole];
        if (!roleConfig) {
            return reply.code(403).send({ success: false, message: `No sending configuration found for role: ${senderRole}` });
        }

        if (messageType === 'email' && !roleConfig.emailEnabled) {
            return reply.code(403).send({ success: false, message: 'Email sending is currently disabled for your role.' });
        }

        if (messageType === 'sms' && !roleConfig.smsEnabled) {
            return reply.code(403).send({ success: false, message: 'SMS sending is currently disabled for your role.' });
        }

        // 2. Select Gateway
        let gatewayUsed = 'None';
        if (messageType === 'email') {
            const defaultGateway = settings.emailGateways.find(g => g.isDefault);
            if (defaultGateway) gatewayUsed = defaultGateway.provider;
        } else if (messageType === 'sms') {
            const defaultGateway = settings.smsGateways.find(g => g.isDefault);
            if (defaultGateway) gatewayUsed = defaultGateway.provider;
        }

        // 3. Create message record
        // Here you would integrate actual SMTP/SMS provider APIs like Nodemailer or Twilio.
        // For this system, we log it as 'sent' assuming synchronous success or keep it standard.

        const message = new Message({
            messageType,
            recipientEmail,
            recipientPhone,
            subject,
            content,
            gatewayUsed,
            senderRole,
            status: status || 'sent', // If we mock sending, make it 'sent'
            sentBy: request.user._id,
            branchId: request.user.branch || null,
            sentAt: new Date()
        });

        await message.save();

        return reply.code(201).send({
            success: true,
            message: 'Message processed successfully',
            data: message
        });
    } catch (error) {
        return reply.code(500).send({ success: false, message: error ? error.message : 'Error' });
    }
};

export const getAllMessages = async (request, reply) => {
    try {
        const { page = 1, limit = 10, messageType, status, startDate, endDate, keyword } = request.query;

        const query = {};

        // Role-based visibility
        if (request.user.role === 'branch') {
            query.branchId = request.user.branch;
        } else if (request.user.role === 'admin' && request.user.branch) {
           // Admin might see everything or specific branch depending on system design
        }

        if (messageType) query.messageType = messageType;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (keyword) {
            query.$or = [
                { subject: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } },
                { recipientEmail: { $regex: keyword, $options: 'i' } },
                { recipientPhone: { $regex: keyword, $options: 'i' } }
            ];
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: [
                { path: 'sentBy', select: 'first_name last_name email' },
                { path: 'branchId', select: 'name' }
            ]
        };

        const totalDocuments = await Message.countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / options.limit);
        const skip = (options.page - 1) * options.limit;

        const messages = await Message.find(query)
            .populate(options.populate)
            .sort(options.sort)
            .skip(skip)
            .limit(options.limit);

        return reply.code(200).send({
            success: true,
            data: {
                docs: messages,
                totalDocs: totalDocuments,
                limit: options.limit,
                page: options.page,
                totalPages,
                hasNextPage: options.page < totalPages,
                hasPrevPage: options.page > 1
            }
        });

    } catch (error) {
        return reply.code(500).send({ success: false, message: error ? error.message : 'Error' });
    }
};

export const getMessageById = async (request, reply) => {
    try {
        const message = await Message.findById(request.params.id)
            .populate('sentBy', 'first_name last_name email')
            .populate('branchId', 'name');

        if (!message) {
            return reply.code(404).send({ success: false, message: 'Message not found' });
        }

        if (request.user.role === 'branch' && message.branchId && message.branchId.toString() !== request.user.branch.toString()) {
            return reply.code(403).send({ success: false, message: 'Not authorized to access this message' });
        }

        return reply.code(200).send({
            success: true,
            data: message
        });
    } catch (error) {
        return reply.code(500).send({ success: false, message: error ? error.message : 'Error' });
    }
};

export const updateMessage = async (request, reply) => {
    try {
        const message = await Message.findById(request.params.id);
        
        if (!message) {
            return reply.code(404).send({ success: false, message: 'Message not found' });
        }

        if (request.user.role === 'branch' && message.branchId && message.branchId.toString() !== request.user.branch.toString()) {
            return reply.code(403).send({ success: false, message: 'Not authorized to modify this message' });
        }

        Object.assign(message, request.body);
        await message.save();

        return reply.code(200).send({
            success: true,
            data: message
        });
    } catch (error) {
        return reply.code(500).send({ success: false, message: error ? error.message : 'Error' });
    }
};

export const deleteMessage = async (request, reply) => {
    try {
        const message = await Message.findById(request.params.id);
        
        if (!message) {
            return reply.code(500).send({ success: false, message: error ? error.message : 'Error' });
        }

        await message.deleteOne();

        return reply.code(200).send({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        return reply.code(500).send({ success: false, message: error ? error.message : 'Error' });
    }
};

export const exportMessages = async (request, reply) => {
    try {
        const { messageType, status, startDate, endDate } = request.query;
        let query = {};

        if (request.user.role === 'branch') {
            query.branchId = request.user.branch;
        }

        if (messageType) query.messageType = messageType;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const messages = await Message.find(query).populate('sentBy', 'first_name last_name role');

        const fields = ['_id', 'messageType', 'recipientEmail', 'recipientPhone', 'subject', 'status', 'senderRole', 'gatewayUsed', 'createdAt'];
        const data = messages.map(msg => ({
            _id: msg._id.toString(),
            messageType: msg.messageType,
            recipientEmail: msg.recipientEmail || '',
            recipientPhone: msg.recipientPhone || '',
            subject: msg.subject || '',
            status: msg.status,
            senderRole: msg.senderRole,
            gatewayUsed: msg.gatewayUsed || '',
            createdAt: msg.createdAt.toISOString()
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename=messages.csv');
        return reply.send(stringify(data, { header: true, columns: fields }));
    } catch (error) {
        return reply.code(500).send({ success: false, message: error ? error.message : 'Error' });
    }
};

export const importMessages = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'Please upload a CSV file' });

        const results = [];
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));
        for await (const row of parser) {
            results.push({
                messageType: row.messageType,
                recipientEmail: row.recipientEmail,
                recipientPhone: row.recipientPhone,
                subject: row.subject,
                content: row.content || 'Imported Content',
                status: row.status || 'draft',
                senderRole: request.user.role,
                sentBy: request.user._id,
                branchId: request.user.branch || null
            });
        }

        try {
            await Message.insertMany(results);
        } catch (e) {
            console.error('Import Error', e);
        }

        return reply.code(200).send({
            success: true,
            message: 'CSV file processed for import'
        });
    } catch (error) {
        return reply.code(500).send({ success: false, message: error ? error.message : 'Error' });
    }
};
