import Visitor from '../models/Visitor.js';
import Student from '../models/Student.js';
import Transaction from '../models/Transaction.js';
import PartnerAgency from '../models/PartnerAgency.js';
import logger from '../services/logger.service.js';

export const getAgencyPerformanceReport = async (request, reply) => {
    try {
        const { startDate, endDate, branch, agencyId } = request.query;
        
        const dateFilter = {};
        if (startDate || endDate) {
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) dateFilter.$lte = new Date(endDate);
        }

        const query = {};
        if (branch) query.branch = branch;
        if (agencyId) query._id = agencyId;

        const agencies = await PartnerAgency.find(query).lean();
        
        const report = await Promise.all(agencies.map(async (agency) => {
            const matchQuery = { partnerAgency: agency._id };
            if (startDate || endDate) matchQuery.createdAt = dateFilter;

            const visitorCount = await Visitor.countDocuments(matchQuery);
            const studentCount = await Student.countDocuments(matchQuery);
            
            // Financials
            const transactionMatch = { partnerAgency: agency._id, status: 'completed' };
            if (startDate || endDate) transactionMatch.date = dateFilter;

            const financialStats = await Transaction.aggregate([
                { $match: transactionMatch },
                {
                    $group: {
                        _id: null,
                        totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
                        totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
                    }
                }
            ]);

            const totals = financialStats[0] || { totalIncome: 0, totalExpense: 0 };

            return {
                agencyName: agency.agencyName,
                agencyId: agency._id,
                ownerName: agency.ownerName,
                metrics: {
                    totalVisitors: visitorCount,
                    totalStudents: studentCount,
                    conversionRate: visitorCount > 0 ? (studentCount / visitorCount) * 100 : 0
                },
                financials: {
                    revenueGenerated: totals.totalIncome,
                    commissionsPaid: totals.totalExpense, // Assuming commission is recorded as expense
                    netProfit: totals.totalIncome - totals.totalExpense
                }
            };
        }));

        return reply.send({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to generate agency performance report.' });
    }
};

export const getAgencyFinancialSummary = async (request, reply) => {
    try {
        const { agencyId } = request.params;
        const { startDate, endDate } = request.query;

        const dateFilter = {};
        if (startDate || endDate) {
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) dateFilter.$lte = new Date(endDate);
        }

        const transactionMatch = { partnerAgency: agencyId, status: 'completed' };
        if (startDate || endDate) transactionMatch.date = dateFilter;

        const transactions = await Transaction.find(transactionMatch)
            .populate('student', 'fullNameEn')
            .sort({ date: -1 });

        return reply.send({
            success: true,
            data: transactions
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch agency financial summary.' });
    }
};
