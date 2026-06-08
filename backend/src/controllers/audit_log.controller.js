import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import AuditLog from '../models/AuditLog.js';
import logger from '../services/logger.service.js';

/**
 * GET /audit-logs
 * List audit logs with filters, pagination, date range.
 */
export const getAllAuditLogs = async (request, reply) => {
    try {
        const { page = 1, limit = 20, search, entityType, action, performedBy, entityId, startDate, endDate } = request.query;
        const query = {};

        if (entityType) query.entityType = entityType;
        if (action) query.action = action;
        if (performedBy) query.performedBy = performedBy;
        if (entityId) query.entityId = entityId;
        if (search) {
            query.$or = [
                { entityType: { $regex: search, $options: 'i' } },
                { performedByName: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate('performedBy', 'fullName email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            AuditLog.countDocuments(query)
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
        return reply.code(500).send({ success: false, message: 'Failed to fetch audit logs.' });
    }
};

/**
 * GET /audit-logs/:id
 * Get a single audit log entry with full details.
 */
export const getAuditLogById = async (request, reply) => {
    try {
        const log = await AuditLog.findById(request.params.id)
            .populate('performedBy', 'fullName email role');
        if (!log) return reply.code(404).send({ success: false, message: 'Audit log not found.' });
        return reply.send({ success: true, data: log });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch audit log.' });
    }
};

/**
 * GET /audit-logs/entity/:entityType/:entityId
 * Get all audit history for a specific entity.
 */
export const getEntityHistory = async (request, reply) => {
    try {
        const { entityType, entityId } = request.params;
        const { page = 1, limit = 50 } = request.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            AuditLog.find({ entityType, entityId })
                .populate('performedBy', 'fullName email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            AuditLog.countDocuments({ entityType, entityId })
        ]);

        return reply.code(200).send({
            success: true,
            data: logs,
            pagination: { total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch entity history.' });
    }
};

/**
 * GET /audit-logs/stats
 * Get audit log statistics (counts by action, entity type, user).
 */
export const getAuditStats = async (request, reply) => {
    try {
        const { startDate, endDate } = request.query;
        const match = {};
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        const [byAction, byEntity, byUser] = await Promise.all([
            AuditLog.aggregate([
                { $match: match },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            AuditLog.aggregate([
                { $match: match },
                { $group: { _id: '$entityType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            AuditLog.aggregate([
                { $match: match },
                { $group: { _id: '$performedBy', count: { $sum: 1 }, name: { $first: '$performedByName' } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ])
        ]);

        return reply.send({ success: true, data: { byAction, byEntity, byUser } });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch audit stats.' });
    }
};

/**
 * DELETE /audit-logs/purge
 * Purge audit logs older than specified date (retention policy).
 */
export const purgeAuditLogs = async (request, reply) => {
    try {
        const { beforeDate } = request.body;
        if (!beforeDate) return reply.code(400).send({ success: false, message: 'beforeDate is required.' });

        const result = await AuditLog.deleteMany({ createdAt: { $lt: new Date(beforeDate) } });
        return reply.send({ success: true, message: `Purged ${result.deletedCount} audit log entries.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to purge audit logs.' });
    }
};

/**
 * GET /audit-logs/export
 * Export audit logs to CSV.
 */
export const exportAuditLogs = async (request, reply) => {
    try {
        const { entityType, action, startDate, endDate } = request.query;
        const query = {};
        if (entityType) query.entityType = entityType;
        if (action) query.action = action;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .populate('performedBy', 'fullName email')
            .sort({ createdAt: -1 })
            .lean();

        const csvData = logs.map(l => ({
            Date: new Date(l.createdAt).toLocaleString(),
            Action: l.action,
            'Entity Type': l.entityType,
            'Entity ID': l.entityId?.toString(),
            'Performed By': l.performedBy?.fullName || l.performedByName || 'System',
            Email: l.performedBy?.email || '',
            'IP Address': l.ipAddress || '',
            'Changes Count': l.changes?.length || 0,
            Notes: l.notes || ''
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="audit_logs.csv"');
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export audit logs.' });
    }
};
