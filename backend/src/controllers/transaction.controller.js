import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Transaction from '../models/Transaction.js';
import logger from '../services/logger.service.js';

export const getAllTransactions = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, type, category, paymentMethod, branch, status, student, agent, partnerAgency, startDate, endDate } = request.query;
        const query = {};

        // Permissions Check: Non-admins might be limited to their own branch
        if (request.user.role === 'branch' && request.user.branch) {
            query.branch = request.user.branch;
        } else if (branch) {
            query.branch = branch;
        }

        if (search) {
            query.item = { $regex: search, $options: 'i' };
        }
        if (type) query.type = type;
        if (category) query.category = category;
        if (paymentMethod) query.paymentMethod = paymentMethod;
        if (status) query.status = status;
        if (student) query.student = student;
        if (agent) query.agent = agent;
        if (partnerAgency) query.partnerAgency = partnerAgency;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('student', 'fullNameEn phone email')
                .populate('agent', 'fullName phone email')
                .populate('partnerAgency', 'agencyName')
                .populate('branch', 'name')
                .populate('recordedBy', 'fullName')
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: transactions,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch transactions.' });
    }
};

export const getTransactionStats = async (request, reply) => {
    try {
        const { branch, startDate, endDate } = request.query;
        const query = {};

        if (request.user.role === 'branch' && request.user.branch) {
            query.branch = request.user.branch;
        } else if (branch) {
            query.branch = branch;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const stats = await Transaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                    },
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = stats[0] || { totalIncome: 0, totalExpense: 0, count: 0 };
        
        return reply.code(200).send({
            success: true,
            data: {
                ...result,
                netBalance: result.totalIncome - result.totalExpense
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch financial stats.' });
    }
};

export const createTransaction = async (request, reply) => {
    try {
        const transactionData = {
            ...request.body,
            recordedBy: request.user._id
        };

        const transaction = await Transaction.create(transactionData);
        const populated = await transaction.populate([
            { path: 'branch', select: 'name' },
            { path: 'recordedBy', select: 'fullName' }
        ]);

        return reply.code(201).send({ success: true, message: 'Transaction recorded successfully.', data: populated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to record transaction.' });
    }
};

export const updateTransaction = async (request, reply) => {
    try {
        const { id } = request.params;
        const transaction = await Transaction.findById(id);
        if (!transaction) return reply.code(404).send({ success: false, message: 'Transaction not found.' });

        // Only super_admin or admin can update financial records usually
        if (!['super_admin', 'admin', 'accounts'].includes(request.user.role)) {
             return reply.code(403).send({ success: false, message: 'Unauthorized to update financial records.' });
        }

        Object.assign(transaction, request.body);
        await transaction.save();

        const updated = await Transaction.findById(id)
            .populate('student', 'fullNameEn')
            .populate('branch', 'name')
            .populate('recordedBy', 'fullName');

        return reply.send({ success: true, message: 'Transaction updated successfully.', data: updated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update transaction.' });
    }
};

export const deleteTransaction = async (request, reply) => {
    try {
        const transaction = await Transaction.findById(request.params.id);
        if (!transaction) return reply.code(404).send({ success: false, message: 'Transaction not found.' });

        if (!['super_admin', 'admin'].includes(request.user.role)) {
            return reply.code(403).send({ success: false, message: 'Unauthorized to delete financial records.' });
        }

        await Transaction.findByIdAndDelete(request.params.id);
        return reply.send({ success: true, message: 'Transaction deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete transaction.' });
    }
};

export const exportTransactions = async (request, reply) => {
    try {
        const transactions = await Transaction.find()
            .populate('branch', 'name')
            .populate('student', 'fullNameEn')
            .populate('agent', 'fullName')
            .populate('partnerAgency', 'agencyName')
            .populate('recordedBy', 'fullName')
            .lean();

        const csvData = transactions.map(t => ({
            Date: new Date(t.date).toLocaleDateString(),
            Item: t.item,
            Type: t.type,
            Category: t.category,
            Amount: t.amount,
            Status: t.status,
            'Payment Method': t.paymentMethod,
            Branch: t.branch?.name || 'N/A',
            Student: t.student?.fullNameEn || 'N/A',
            Agent: t.agent?.fullName || 'N/A',
            'Partner Agency': t.partnerAgency?.agencyName || 'N/A',
            'Recorded By': t.recordedBy?.fullName || 'N/A',
            Reference: t.reference || ''
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="transactions_export.csv"`);
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export transactions.' });
    }
};

export const importTransactions = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Item'] && row['Amount']) {
                // Simplified import: needs a default branch if not specified
                // In a real scenario, we would lookup branch ID by name
                await Transaction.create({
                    item: row['Item'],
                    type: row['Type']?.toLowerCase() || 'income',
                    category: row['Category']?.toLowerCase() || 'other',
                    amount: parseFloat(row['Amount']),
                    paymentMethod: row['Payment Method']?.toLowerCase() || 'cash',
                    branch: request.user.branch || null, // Best effort or admin's branch
                    recordedBy: request.user._id,
                    date: row['Date'] ? new Date(row['Date']) : new Date()
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported ${created} transactions.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import transactions.' });
    }
};
