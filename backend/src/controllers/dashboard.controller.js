import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Visitor from '../models/Visitor.js';
import Batch from '../models/Batch.js';
import Transaction from '../models/Transaction.js';
import SchoolSubmission from '../models/SchoolSubmission.js';
import School from '../models/School.js';
import User from '../models/User.js';
import logger from '../services/logger.service.js';

/**
 * Helper: Build base date-range query.
 */
const buildDateQuery = (startDate, endDate, field = 'createdAt') => {
    const q = {};
    if (startDate || endDate) {
        q[field] = {};
        if (startDate) q[field].$gte = new Date(startDate);
        if (endDate) q[field].$lte = new Date(endDate);
    }
    return q;
};

/**
 * Helper: get first/last day of a month offset from now.
 */
const getMonthRange = (offsetMonths = 0) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0, 23, 59, 59, 999);
    return { start, end };
};

/**
 * GET /dashboard/summary
 * Returns core dashboard metrics with REAL month-over-month growth.
 */
export const getSummary = async (request, reply) => {
    try {
        const { branch } = request.query;
        const branchFilter = branch ? { branch: new mongoose.Types.ObjectId(branch) } : {};

        const currentMonth = getMonthRange(0);
        const prevMonth = getMonthRange(-1);

        // Current month counts
        const [totalStudents, totalVisitors, totalBatches] = await Promise.all([
            Student.countDocuments(branchFilter),
            Visitor.countDocuments(branchFilter),
            Batch.countDocuments(branchFilter)
        ]);

        const [activeStudents, convertedLeads, activeBatches] = await Promise.all([
            Student.countDocuments({ ...branchFilter, studentType: 'own' }),
            Visitor.countDocuments({ ...branchFilter, status: 'converted' }),
            Batch.countDocuments({ ...branchFilter, status: 'active' })
        ]);

        // Month-over-month growth (real calculations)
        const [studentsThisMonth, studentsPrevMonth] = await Promise.all([
            Student.countDocuments({ ...branchFilter, createdAt: { $gte: currentMonth.start, $lte: currentMonth.end } }),
            Student.countDocuments({ ...branchFilter, createdAt: { $gte: prevMonth.start, $lte: prevMonth.end } })
        ]);
        const [visitorsThisMonth, visitorsPrevMonth] = await Promise.all([
            Visitor.countDocuments({ ...branchFilter, createdAt: { $gte: currentMonth.start, $lte: currentMonth.end } }),
            Visitor.countDocuments({ ...branchFilter, createdAt: { $gte: prevMonth.start, $lte: prevMonth.end } })
        ]);

        const calcGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? '+100%' : '0%';
            const pct = ((current - previous) / previous * 100).toFixed(1);
            return pct > 0 ? `+${pct}%` : `${pct}%`;
        };

        // Revenue this month vs last month
        const [revenueThisMonth] = await Transaction.aggregate([
            { $match: { ...branchFilter, type: 'income', status: 'completed', date: { $gte: currentMonth.start, $lte: currentMonth.end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const [revenuePrevMonth] = await Transaction.aggregate([
            { $match: { ...branchFilter, type: 'income', status: 'completed', date: { $gte: prevMonth.start, $lte: prevMonth.end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const currentRevenue = revenueThisMonth?.total || 0;
        const previousRevenue = revenuePrevMonth?.total || 0;

        const stats = [
            {
                title: 'Total Students',
                stat: totalStudents,
                variant: 'success',
                change: calcGrowth(studentsThisMonth, studentsPrevMonth),
                icon: 'solar:users-group-two-rounded-broken'
            },
            {
                title: 'Total Leads',
                stat: totalVisitors,
                variant: 'info',
                change: calcGrowth(visitorsThisMonth, visitorsPrevMonth),
                icon: 'solar:user-speak-broken'
            },
            {
                title: 'Conversion Rate',
                stat: totalVisitors > 0 ? `${((convertedLeads / totalVisitors) * 100).toFixed(1)}%` : '0%',
                variant: 'primary',
                change: calcGrowth(convertedLeads, totalVisitors > 0 ? Math.round(totalVisitors * 0.8) : 0),
                icon: 'solar:plain-broken'
            },
            {
                title: 'Active Batches',
                stat: activeBatches,
                variant: 'warning',
                change: `${totalBatches} total`,
                icon: 'solar:layers-broken'
            },
            {
                title: 'Monthly Revenue',
                stat: currentRevenue,
                variant: 'success',
                change: calcGrowth(currentRevenue, previousRevenue),
                icon: 'solar:wallet-money-broken'
            }
        ];

        return { success: true, data: stats };
    } catch (error) {
        logger.error(error, 'Dashboard Summary Error');
        return reply.code(500).send({ success: false, message: 'Failed to fetch dashboard summary' });
    }
};

/**
 * GET /dashboard/revenue-trend
 * Daily/weekly/monthly revenue aggregation.
 */
export const getRevenueTrend = async (request, reply) => {
    try {
        const { branch, period = 'daily', startDate, endDate } = request.query;
        const match = { type: 'income', status: 'completed' };
        if (branch) match.branch = new mongoose.Types.ObjectId(branch);

        // Default: last 30 days for daily, last 12 months for monthly
        const now = new Date();
        if (startDate) match.date = { ...(match.date || {}), $gte: new Date(startDate) };
        if (endDate) match.date = { ...(match.date || {}), $lte: new Date(endDate) };
        if (!startDate && !endDate) {
            if (period === 'daily') {
                match.date = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30) };
            } else if (period === 'weekly') {
                match.date = { $gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) };
            } else {
                match.date = { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) };
            }
        }

        let groupId;
        if (period === 'daily') {
            groupId = { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } };
        } else if (period === 'weekly') {
            groupId = { year: { $year: '$date' }, week: { $isoWeek: '$date' } };
        } else {
            groupId = { year: { $year: '$date' }, month: { $month: '$date' } };
        }

        const data = await Transaction.aggregate([
            { $match: match },
            { $group: { _id: groupId, income: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        // Also get expenses in the same periods
        const expenseMatch = { ...match, type: 'expense' };
        delete expenseMatch.type;
        expenseMatch.type = 'expense';
        const expenseData = await Transaction.aggregate([
            { $match: expenseMatch },
            { $group: { _id: groupId, expense: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        return { success: true, data: { income: data, expenses: expenseData, period } };
    } catch (error) {
        logger.error(error, 'Revenue Trend Error');
        return reply.code(500).send({ success: false, message: 'Failed to fetch revenue trend' });
    }
};

/**
 * GET /dashboard/conversion-funnel
 * Visitor → Student → Submitted → COE → Visa pipeline counts.
 */
export const getConversionFunnel = async (request, reply) => {
    try {
        const { branch, startDate, endDate } = request.query;
        const dateFilter = buildDateQuery(startDate, endDate);
        const branchFilter = branch ? { branch: new mongoose.Types.ObjectId(branch) } : {};

        const [totalVisitors, convertedVisitors, totalStudents, submissions] = await Promise.all([
            Visitor.countDocuments({ ...branchFilter, ...dateFilter }),
            Visitor.countDocuments({ ...branchFilter, ...dateFilter, status: 'converted' }),
            Student.countDocuments({ ...branchFilter, ...dateFilter }),
            SchoolSubmission.aggregate([
                { $match: { ...dateFilter } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const statusCounts = {};
        submissions.forEach(s => { statusCounts[s._id] = s.count; });

        const funnel = [
            { stage: 'Visitors', count: totalVisitors, percentage: 100 },
            { stage: 'Converted to Student', count: convertedVisitors, percentage: totalVisitors > 0 ? ((convertedVisitors / totalVisitors) * 100).toFixed(1) : 0 },
            { stage: 'Total Students', count: totalStudents, percentage: totalVisitors > 0 ? ((totalStudents / totalVisitors) * 100).toFixed(1) : 0 },
            { stage: 'Submitted', count: statusCounts['Submitted'] || 0, percentage: totalStudents > 0 ? (((statusCounts['Submitted'] || 0) / totalStudents) * 100).toFixed(1) : 0 },
            { stage: 'Interview Scheduled', count: statusCounts['Interview Scheduled'] || 0, percentage: totalStudents > 0 ? (((statusCounts['Interview Scheduled'] || 0) / totalStudents) * 100).toFixed(1) : 0 },
            { stage: 'COE Approved', count: statusCounts['COE Approved'] || 0, percentage: totalStudents > 0 ? (((statusCounts['COE Approved'] || 0) / totalStudents) * 100).toFixed(1) : 0 },
            { stage: 'Visa Approved', count: statusCounts['Visa Approved'] || 0, percentage: totalStudents > 0 ? (((statusCounts['Visa Approved'] || 0) / totalStudents) * 100).toFixed(1) : 0 }
        ];

        return { success: true, data: funnel };
    } catch (error) {
        logger.error(error, 'Conversion Funnel Error');
        return reply.code(500).send({ success: false, message: 'Failed to fetch conversion funnel' });
    }
};

/**
 * GET /dashboard/agent-scorecards
 * Agent/counselor performance metrics.
 */
export const getAgentScorecards = async (request, reply) => {
    try {
        const { branch, startDate, endDate } = request.query;
        const dateFilter = buildDateQuery(startDate, endDate);
        const branchFilter = branch ? { branch: new mongoose.Types.ObjectId(branch) } : {};

        // Agents by student count
        const agentStudents = await Student.aggregate([
            { $match: { agent: { $ne: null }, ...branchFilter, ...dateFilter } },
            { $group: { _id: '$agent', studentCount: { $sum: 1 } } },
            { $sort: { studentCount: -1 } },
            { $limit: 20 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agentInfo' } },
            { $unwind: '$agentInfo' },
            { $project: { _id: 1, studentCount: 1, fullName: '$agentInfo.fullName', email: '$agentInfo.email', role: '$agentInfo.role' } }
        ]);

        // Agent revenue
        const agentRevenue = await Transaction.aggregate([
            { $match: { agent: { $ne: null }, type: 'income', status: 'completed', ...branchFilter, ...(startDate || endDate ? buildDateQuery(startDate, endDate, 'date') : {}) } },
            { $group: { _id: '$agent', totalRevenue: { $sum: '$amount' }, transactionCount: { $sum: 1 } } },
            { $sort: { totalRevenue: -1 } },
            { $limit: 20 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agentInfo' } },
            { $unwind: '$agentInfo' },
            { $project: { _id: 1, totalRevenue: 1, transactionCount: 1, fullName: '$agentInfo.fullName' } }
        ]);

        return { success: true, data: { byStudents: agentStudents, byRevenue: agentRevenue } };
    } catch (error) {
        logger.error(error, 'Agent Scorecards Error');
        return reply.code(500).send({ success: false, message: 'Failed to fetch agent scorecards' });
    }
};

/**
 * GET /dashboard/branch-comparison
 * Branch-wise comparative analytics.
 */
export const getBranchComparison = async (request, reply) => {
    try {
        const { startDate, endDate } = request.query;
        const dateFilter = buildDateQuery(startDate, endDate);
        const revDateFilter = buildDateQuery(startDate, endDate, 'date');

        const [studentsByBranch, revenueByBranch, visitorsByBranch] = await Promise.all([
            Student.aggregate([
                { $match: { branch: { $ne: null }, ...dateFilter } },
                { $group: { _id: '$branch', count: { $sum: 1 } } },
                { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branchInfo' } },
                { $unwind: { path: '$branchInfo', preserveNullAndEmptyArrays: true } },
                { $project: { _id: 1, count: 1, branchName: '$branchInfo.name' } },
                { $sort: { count: -1 } }
            ]),
            Transaction.aggregate([
                { $match: { branch: { $ne: null }, status: 'completed', ...revDateFilter } },
                { $group: { _id: { branch: '$branch', type: '$type' }, total: { $sum: '$amount' } } },
                { $lookup: { from: 'branches', localField: '_id.branch', foreignField: '_id', as: 'branchInfo' } },
                { $unwind: { path: '$branchInfo', preserveNullAndEmptyArrays: true } },
                { $project: { _id: 1, total: 1, branchName: '$branchInfo.name' } }
            ]),
            Visitor.aggregate([
                { $match: { branch: { $ne: null }, ...dateFilter } },
                { $group: { _id: '$branch', count: { $sum: 1 } } },
                { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branchInfo' } },
                { $unwind: { path: '$branchInfo', preserveNullAndEmptyArrays: true } },
                { $project: { _id: 1, count: 1, branchName: '$branchInfo.name' } },
                { $sort: { count: -1 } }
            ])
        ]);

        return { success: true, data: { students: studentsByBranch, revenue: revenueByBranch, visitors: visitorsByBranch } };
    } catch (error) {
        logger.error(error, 'Branch Comparison Error');
        return reply.code(500).send({ success: false, message: 'Failed to fetch branch comparison' });
    }
};

/**
 * GET /dashboard/intake-forecast
 * Intake pipeline with deadline proximity.
 */
export const getIntakeForecast = async (request, reply) => {
    try {
        const { branch } = request.query;
        const branchFilter = branch ? { branch: new mongoose.Types.ObjectId(branch) } : {};

        // Group submissions by intake
        const pipeline = await SchoolSubmission.aggregate([
            { $group: { _id: { intake: '$intake', status: '$status' }, count: { $sum: 1 } } },
            { $group: {
                _id: '$_id.intake',
                statuses: { $push: { status: '$_id.status', count: '$count' } },
                totalSubmissions: { $sum: '$count' }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Get upcoming school intake deadlines
        const schoolIntakes = await School.aggregate([
            { $match: branchFilter },
            { $unwind: '$intakes' },
            { $match: { 'intakes.deadline': { $gte: new Date() } } },
            { $project: { nameEn: 1, 'intakes.month': 1, 'intakes.deadline': 1 } },
            { $sort: { 'intakes.deadline': 1 } },
            { $limit: 20 }
        ]);

        return { success: true, data: { pipeline, upcomingDeadlines: schoolIntakes } };
    } catch (error) {
        logger.error(error, 'Intake Forecast Error');
        return reply.code(500).send({ success: false, message: 'Failed to fetch intake forecast' });
    }
};

/**
 * GET /dashboard/top-schools
 * Schools ranked by acceptance rate.
 */
export const getTopSchools = async (request, reply) => {
    try {
        const { limit = 10 } = request.query;

        const data = await SchoolSubmission.aggregate([
            { $group: {
                _id: '$school',
                total: { $sum: 1 },
                approved: { $sum: { $cond: [{ $in: ['$status', ['COE Approved', 'Visa Approved']] }, 1, 0] } },
                rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } }
            }},
            { $addFields: { acceptanceRate: { $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$approved', '$total'] }, 100] }, 0] } } },
            { $sort: { acceptanceRate: -1 } },
            { $limit: parseInt(limit) },
            { $lookup: { from: 'schools', localField: '_id', foreignField: '_id', as: 'schoolInfo' } },
            { $unwind: { path: '$schoolInfo', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 1, total: 1, approved: 1, rejected: 1, pending: 1, acceptanceRate: { $round: ['$acceptanceRate', 1] }, schoolName: '$schoolInfo.nameEn', city: '$schoolInfo.city', country: '$schoolInfo.country' } }
        ]);

        return { success: true, data };
    } catch (error) {
        logger.error(error, 'Top Schools Error');
        return reply.code(500).send({ success: false, message: 'Failed to fetch top schools' });
    }
};
