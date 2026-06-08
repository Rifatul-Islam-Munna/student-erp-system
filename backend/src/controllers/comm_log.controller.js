import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import CommunicationLog from '../models/CommunicationLog.js';
import logger from '../services/logger.service.js';

export const getAllLogs = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, type, status, direction, student, visitor, assignedUser, startDate, endDate } = request.query;
        const query = {};

        // Permissions Check: Non-admins only see logs they recorded or are assigned for
        const user = request.user;
        if (!['super_admin', 'admin'].includes(user.role)) {
            query.$or = [
                { assignedUser: user._id },
                { recordedBy: user._id }
            ];
        }

        if (search) {
            query.summary = { $regex: search, $options: 'i' };
        }
        if (type) query.type = type;
        if (status) query.status = status;
        if (direction) query.direction = direction;
        if (student) query.student = student;
        if (visitor) query.visitor = visitor;
        if (assignedUser) query.assignedUser = assignedUser;

        if (startDate || endDate) {
            query.dateTime = {};
            if (startDate) query.dateTime.$gte = new Date(startDate);
            if (endDate) query.dateTime.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            CommunicationLog.find(query)
                .populate('student', 'fullNameEn phone email')
                .populate('visitor', 'fullName phone email')
                .populate('assignedUser', 'fullName role')
                .populate('recordedBy', 'fullName')
                .sort({ dateTime: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            CommunicationLog.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: logs,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch communication logs.' });
    }
};

export const getLogById = async (request, reply) => {
    try {
        const log = await CommunicationLog.findById(request.params.id)
            .populate('student', 'fullNameEn phone email')
            .populate('visitor', 'fullName phone email')
            .populate('assignedUser', 'fullName role')
            .populate('recordedBy', 'fullName');
            
        if (!log) return reply.code(404).send({ success: false, message: 'Log not found.' });

        const user = request.user;
        if (!['super_admin', 'admin'].includes(user.role)) {
            if (log.assignedUser._id.toString() !== user._id.toString() && log.recordedBy._id.toString() !== user._id.toString()) {
                return reply.code(403).send({ success: false, message: 'Unauthorized access to this log.' });
            }
        }

        return reply.code(200).send({ success: true, data: log });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to find communication log.' });
    }
};

export const createLog = async (request, reply) => {
    try {
        const logData = {
            ...request.body,
            recordedBy: request.user._id
        };

        const log = await CommunicationLog.create(logData);
        const populated = await log.populate([
            { path: 'assignedUser', select: 'fullName role' },
            { path: 'recordedBy', select: 'fullName' }
        ]);

        return reply.code(201).send({ success: true, message: 'Log created successfully.', data: populated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create communication log.' });
    }
};

export const updateLog = async (request, reply) => {
    try {
        const { id } = request.params;
        const log = await CommunicationLog.findById(id);
        if (!log) return reply.code(404).send({ success: false, message: 'Log not found.' });

        const user = request.user;
        if (!['super_admin', 'admin'].includes(user.role) && log.recordedBy.toString() !== user._id.toString()) {
             return reply.code(403).send({ success: false, message: 'Unauthorized to update this log.' });
        }

        Object.assign(log, request.body);
        await log.save();

        const updated = await CommunicationLog.findById(id)
            .populate('student', 'fullNameEn phone email')
            .populate('visitor', 'fullName phone email')
            .populate('assignedUser', 'fullName role')
            .populate('recordedBy', 'fullName');

        return reply.send({ success: true, message: 'Log updated successfully.', data: updated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update log.' });
    }
};

export const deleteLog = async (request, reply) => {
    try {
        const log = await CommunicationLog.findById(request.params.id);
        if (!log) return reply.code(404).send({ success: false, message: 'Log not found.' });

        const user = request.user;
        if (!['super_admin', 'admin'].includes(user.role) && log.recordedBy.toString() !== user._id.toString()) {
            return reply.code(403).send({ success: false, message: 'Unauthorized to delete this log.' });
        }

        await CommunicationLog.findByIdAndDelete(request.params.id);
        return reply.send({ success: true, message: 'Log deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete log.' });
    }
};

export const exportLogs = async (request, reply) => {
    try {
        const logs = await CommunicationLog.find()
            .populate('student', 'fullNameEn')
            .populate('visitor', 'fullName')
            .populate('assignedUser', 'fullName')
            .lean();

        const csvData = logs.map(l => ({
            Type: l.type,
            Direction: l.direction,
            Status: l.status,
            Summary: l.summary,
            Details: l.details || '',
            Duration: l.duration || 0,
            Target: l.student ? l.student.fullNameEn : (l.visitor ? l.visitor.fullName : 'N/A'),
            'Assigned To': l.assignedUser?.fullName || 'N/A',
            Date: new Date(l.dateTime).toLocaleString()
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="comm_logs_export.csv"`);
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export logs.' });
    }
};

export const importLogs = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Type'] && row['Summary']) {
                await CommunicationLog.create({
                    type: row['Type'].toLowerCase(),
                    direction: row['Direction']?.toLowerCase() || 'outbound',
                    status: row['Status']?.toLowerCase() || 'connected',
                    summary: row['Summary'],
                    details: row['Details'] || '',
                    duration: row['Duration'] ? parseInt(row['Duration']) : 0,
                    assignedUser: request.user._id,
                    recordedBy: request.user._id,
                    dateTime: row['Date'] ? new Date(row['Date']) : new Date()
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported ${created} logs.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import logs.' });
    }
};
