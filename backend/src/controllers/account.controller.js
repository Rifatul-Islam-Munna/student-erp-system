import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import logger from '../services/logger.service.js';

// --- Account Heads (CRUD) ---

export const getAllAccounts = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, type, isActive, branch } = request.query;
        const query = {};

        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive;
        if (branch) query.branch = branch;
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [accounts, total] = await Promise.all([
            Account.find(query)
                .populate('branch', 'name')
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Account.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: accounts,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch accounts.' });
    }
};

export const createAccount = async (request, reply) => {
    try {
        const account = await Account.create(request.body);
        return reply.code(201).send({ success: true, message: 'Account head created successfully.', data: account });
    } catch (error) {
        logger.error(error);
        if (error.code === 11000) {
            return reply.code(400).send({ success: false, message: 'Account name or code already exists.' });
        }
        return reply.code(500).send({ success: false, message: 'Failed to create account.' });
    }
};

export const updateAccount = async (request, reply) => {
    try {
        const { id } = request.params;
        const account = await Account.findByIdAndUpdate(id, request.body, { new: true });
        if (!account) return reply.code(404).send({ success: false, message: 'Account not found.' });
        return reply.send({ success: true, message: 'Account updated successfully.', data: account });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update account.' });
    }
};

export const deleteAccount = async (request, reply) => {
    try {
        const { id } = request.params;
        // Check if account has transactions
        const hasTransactions = await Transaction.findOne({ account: id });
        if (hasTransactions) {
            return reply.code(400).send({ success: false, message: 'Cannot delete account with existing transactions.' });
        }
        const account = await Account.findByIdAndDelete(id);
        if (!account) return reply.code(404).send({ success: false, message: 'Account not found.' });
        return reply.send({ success: true, message: 'Account deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete account.' });
    }
};

// --- Financial Reports ---

export const getProfitLossReport = async (request, reply) => {
    try {
        const { startDate, endDate, branch } = request.query;
        const query = { status: 'completed' };

        if (branch) query.branch = branch;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query).populate('account');

        let totalIncome = 0;
        let totalExpense = 0;
        const incomeByCategory = {};
        const expenseByCategory = {};

        transactions.forEach(t => {
            const amount = t.amount;
            const category = t.category || 'Other';

            if (t.type === 'income' || t.transactionType === 'income') {
                totalIncome += amount;
                incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
            } else if (t.type === 'expense' || t.transactionType === 'expense' || t.transactionType === 'tax_payment') {
                totalExpense += amount;
                expenseByCategory[category] = (expenseByCategory[category] || 0) + amount;
            }
        });

        return reply.send({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                netProfit: totalIncome - totalExpense,
                incomeByCategory: Object.entries(incomeByCategory).map(([name, amount]) => ({ name, amount })),
                expenseByCategory: Object.entries(expenseByCategory).map(([name, amount]) => ({ name, amount }))
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to generate Profit-Loss report.' });
    }
};

export const getTaxReport = async (request, reply) => {
    try {
        const { startDate, endDate, branch } = request.query;
        const query = { status: 'completed', $or: [{ isTaxable: true }, { transactionType: 'tax_payment' }, { taxAmount: { $gt: 0 } }] };

        if (branch) query.branch = branch;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query);

        let totalTaxCollected = 0;
        let totalTaxPaid = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalTaxCollected += (t.taxAmount || 0);
            } else if (t.type === 'expense' || t.transactionType === 'tax_payment') {
                totalTaxPaid += (t.taxAmount || t.amount); // If tax_payment, entire amount is tax
            }
        });

        return reply.send({
            success: true,
            data: {
                totalTaxCollected,
                totalTaxPaid,
                netTax: totalTaxCollected - totalTaxPaid
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to generate Tax report.' });
    }
};

// --- Data Exchange ---

export const exportAccounts = async (request, reply) => {
    try {
        const accounts = await Account.find().populate('branch', 'name').lean();
        const csvData = accounts.map(a => ({
            Name: a.name,
            Type: a.type,
            Code: a.code || '',
            Description: a.description || '',
            Status: a.isActive ? 'Active' : 'Inactive',
            Branch: a.branch?.name || 'Central'
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="chart_of_accounts.csv"');
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export accounts.' });
    }
};

export const importAccounts = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Name'] && row['Type']) {
                await Account.findOneAndUpdate(
                    { name: row['Name'] },
                    {
                        type: row['Type'].toLowerCase(),
                        code: row['Code'],
                        description: row['Description'],
                        isActive: row['Status']?.toLowerCase() !== 'inactive'
                    },
                    { upsert: true }
                );
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported/Updated ${created} account heads.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import accounts.' });
    }
};
