import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Target from '../models/Target.js';
import Student from '../models/Student.js';
import Transaction from '../models/Transaction.js';
import SchoolSubmission from '../models/SchoolSubmission.js';
import Visitor from '../models/Visitor.js';
import VisaApplication from '../models/VisaApplication.js';
import logger from '../services/logger.service.js';

/**
 * GET /targets
 */
export const getAllTargets = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, metric, period, status, assignedTo, branch, startDate, endDate } = request.query;
        const query = {};

        if (search) query.title = { $regex: search, $options: 'i' };
        if (metric) query.metric = metric;
        if (period) query.period = period;
        if (status) query.status = status;
        if (assignedTo) query.assignedTo = assignedTo;
        if (branch) query.branch = branch;
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.endDate = { $lte: new Date(endDate) };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [targets, total] = await Promise.all([
            Target.find(query)
                .populate('assignedTo', 'fullName email role')
                .populate('branch', 'name')
                .populate('createdBy', 'fullName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Target.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: targets,
            pagination: { total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch targets.' });
    }
};

/**
 * GET /targets/:id
 */
export const getTargetById = async (request, reply) => {
    try {
        const target = await Target.findById(request.params.id)
            .populate('assignedTo', 'fullName email role')
            .populate('branch', 'name')
            .populate('createdBy', 'fullName');
        if (!target) return reply.code(404).send({ success: false, message: 'Target not found.' });
        return reply.send({ success: true, data: target });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch target.' });
    }
};

/**
 * POST /targets
 */
export const createTarget = async (request, reply) => {
    try {
        const target = await Target.create({
            ...request.body,
            createdBy: request.user._id
        });

        const populated = await target.populate([
            { path: 'assignedTo', select: 'fullName email role' },
            { path: 'branch', select: 'name' }
        ]);

        return reply.code(201).send({ success: true, message: 'Target created successfully.', data: populated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create target.' });
    }
};

/**
 * PUT /targets/:id
 */
export const updateTarget = async (request, reply) => {
    try {
        const target = await Target.findById(request.params.id);
        if (!target) return reply.code(404).send({ success: false, message: 'Target not found.' });

        Object.assign(target, request.body);

        // Recalculate achievement percentage
        if (target.targetValue > 0) {
            target.achievementPercentage = Math.round((target.currentValue / target.targetValue) * 100);
            if (target.achievementPercentage >= 100 && target.status === 'active') {
                target.status = target.achievementPercentage > 100 ? 'exceeded' : 'completed';
            }
        }

        await target.save();

        const updated = await Target.findById(request.params.id)
            .populate('assignedTo', 'fullName email role')
            .populate('branch', 'name');

        return reply.send({ success: true, message: 'Target updated successfully.', data: updated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update target.' });
    }
};

/**
 * DELETE /targets/:id
 */
export const deleteTarget = async (request, reply) => {
    try {
        const target = await Target.findByIdAndDelete(request.params.id);
        if (!target) return reply.code(404).send({ success: false, message: 'Target not found.' });
        return reply.send({ success: true, message: 'Target deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete target.' });
    }
};

/**
 * POST /targets/:id/refresh
 * Recalculate current value from real data.
 */
export const refreshTarget = async (request, reply) => {
    try {
        const target = await Target.findById(request.params.id);
        if (!target) return reply.code(404).send({ success: false, message: 'Target not found.' });

        const dateFilter = { createdAt: { $gte: target.startDate, $lte: target.endDate } };
        const assignFilter = target.assignedTo ? { agent: target.assignedTo } : {};
        const branchFilter = target.branch ? { branch: target.branch } : {};

        let currentValue = 0;

        switch (target.metric) {
            case 'students_enrolled':
                currentValue = await Student.countDocuments({ ...dateFilter, ...assignFilter, ...branchFilter });
                break;
            case 'revenue_collected': {
                const revenueDateFilter = { date: { $gte: target.startDate, $lte: target.endDate } };
                const result = await Transaction.aggregate([
                    { $match: { type: 'income', status: 'completed', ...revenueDateFilter, ...assignFilter, ...branchFilter } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                currentValue = result[0]?.total || 0;
                break;
            }
            case 'submissions_made':
                currentValue = await SchoolSubmission.countDocuments({ ...dateFilter });
                break;
            case 'visitors_converted':
                currentValue = await Visitor.countDocuments({ status: 'converted', ...dateFilter, ...branchFilter });
                break;
            case 'visa_approved':
                currentValue = await VisaApplication.countDocuments({ status: { $in: ['Visa Approved', 'Visa Issued'] }, ...dateFilter, ...branchFilter });
                break;
            default:
                break;
        }

        target.currentValue = currentValue;
        target.achievementPercentage = target.targetValue > 0 ? Math.round((currentValue / target.targetValue) * 100) : 0;
        if (target.achievementPercentage >= 100 && target.status === 'active') {
            target.status = target.achievementPercentage > 100 ? 'exceeded' : 'completed';
        }
        await target.save();

        return reply.send({ success: true, message: 'Target refreshed.', data: target });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to refresh target.' });
    }
};

/**
 * GET /targets/leaderboard
 * Leaderboard: rank users by target achievement.
 */
export const getLeaderboard = async (request, reply) => {
    try {
        const { period, metric } = request.query;
        const match = { status: { $in: ['active', 'completed', 'exceeded'] } };
        if (period) match.period = period;
        if (metric) match.metric = metric;

        const leaderboard = await Target.aggregate([
            { $match: { ...match, assignedTo: { $ne: null } } },
            { $group: {
                _id: '$assignedTo',
                totalTargetValue: { $sum: '$targetValue' },
                totalCurrentValue: { $sum: '$currentValue' },
                targetsCount: { $sum: 1 },
                completedCount: { $sum: { $cond: [{ $in: ['$status', ['completed', 'exceeded']] }, 1, 0] } },
                avgAchievement: { $avg: '$achievementPercentage' }
            }},
            { $sort: { avgAchievement: -1 } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            { $project: {
                _id: 1,
                fullName: '$userInfo.fullName',
                email: '$userInfo.email',
                role: '$userInfo.role',
                totalTargetValue: 1,
                totalCurrentValue: 1,
                targetsCount: 1,
                completedCount: 1,
                avgAchievement: { $round: ['$avgAchievement', 1] }
            }}
        ]);

        return reply.send({ success: true, data: leaderboard });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch leaderboard.' });
    }
};

/**
 * GET /targets/export
 */
export const exportTargets = async (request, reply) => {
    try {
        const targets = await Target.find()
            .populate('assignedTo', 'fullName')
            .populate('branch', 'name')
            .lean();

        const csvData = targets.map(t => ({
            Title: t.title,
            Metric: t.metric,
            Period: t.period,
            'Target Value': t.targetValue,
            'Current Value': t.currentValue,
            'Achievement %': t.achievementPercentage,
            Status: t.status,
            'Assigned To': t.assignedTo?.fullName || 'N/A',
            Branch: t.branch?.name || 'N/A',
            'Start Date': new Date(t.startDate).toLocaleDateString(),
            'End Date': new Date(t.endDate).toLocaleDateString()
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="targets.csv"');
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export targets.' });
    }
};

/**
 * POST /targets/import
 */
export const importTargets = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Title'] && row['Target Value']) {
                await Target.create({
                    title: row['Title'],
                    metric: row['Metric']?.toLowerCase() || 'custom',
                    period: row['Period']?.toLowerCase() || 'monthly',
                    targetValue: parseFloat(row['Target Value']),
                    startDate: row['Start Date'] ? new Date(row['Start Date']) : new Date(),
                    endDate: row['End Date'] ? new Date(row['End Date']) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    createdBy: request.user._id
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported ${created} targets.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import targets.' });
    }
};
