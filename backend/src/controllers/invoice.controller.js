import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Invoice from '../models/Invoice.js';
import Transaction from '../models/Transaction.js';
import Setting from '../models/Setting.js';
import logger from '../services/logger.service.js';

/**
 * Generate sequential invoice number with branch prefix.
 */
const generateInvoiceNumber = async (branchPrefix = 'INV') => {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 }).lean();
    const lastNum = lastInvoice ? parseInt(lastInvoice.invoiceNumber.replace(/\D/g, '')) || 0 : 0;
    const nextNum = String(lastNum + 1).padStart(6, '0');
    return `${branchPrefix}-${nextNum}`;
};

/**
 * GET /invoices
 */
export const getAllInvoices = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, status, student, branch, startDate, endDate } = request.query;
        const query = {};

        if (request.user.role === 'branch' && request.user.branch) {
            query.branch = request.user.branch;
        } else if (branch) {
            query.branch = branch;
        }

        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { recipientName: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) query.status = status;
        if (student) query.student = student;
        if (startDate || endDate) {
            query.issueDate = {};
            if (startDate) query.issueDate.$gte = new Date(startDate);
            if (endDate) query.issueDate.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [invoices, total] = await Promise.all([
            Invoice.find(query)
                .populate('student', 'fullNameEn phone email')
                .populate('branch', 'name')
                .populate('createdBy', 'fullName')
                .populate('partnerAgency', 'agencyName')
                .sort({ issueDate: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Invoice.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: invoices,
            pagination: { total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch invoices.' });
    }
};

/**
 * GET /invoices/:id
 */
export const getInvoiceById = async (request, reply) => {
    try {
        const invoice = await Invoice.findById(request.params.id)
            .populate('student', 'fullNameEn phone email dob passportNo')
            .populate('branch', 'name')
            .populate('createdBy', 'fullName')
            .populate('transaction')
            .populate('partnerAgency', 'agencyName');
        if (!invoice) return reply.code(404).send({ success: false, message: 'Invoice not found.' });
        return reply.send({ success: true, data: invoice });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch invoice.' });
    }
};

/**
 * POST /invoices
 */
export const createInvoice = async (request, reply) => {
    try {
        const { items, taxRate = 0, discount = 0, ...rest } = request.body;

        // Calculate totals
        const computedItems = items.map(item => ({
            ...item,
            amount: item.quantity * item.unitPrice
        }));
        const subtotal = computedItems.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = (subtotal * taxRate) / 100;
        const totalAmount = subtotal + taxAmount - discount;
        const dueAmount = totalAmount - (rest.paidAmount || 0);

        const invoiceNumber = await generateInvoiceNumber('INV');

        const invoice = await Invoice.create({
            ...rest,
            invoiceNumber,
            items: computedItems,
            subtotal,
            taxRate,
            taxAmount,
            discount,
            totalAmount,
            dueAmount,
            branch: rest.branch || request.user.branch,
            createdBy: request.user._id
        });

        const populated = await invoice.populate([
            { path: 'student', select: 'fullNameEn phone email' },
            { path: 'branch', select: 'name' },
            { path: 'createdBy', select: 'fullName' }
        ]);

        return reply.code(201).send({ success: true, message: 'Invoice created successfully.', data: populated });
    } catch (error) {
        logger.error(error);
        if (error.code === 11000) return reply.code(400).send({ success: false, message: 'Invoice number already exists.' });
        return reply.code(500).send({ success: false, message: 'Failed to create invoice.' });
    }
};

/**
 * PUT /invoices/:id
 */
export const updateInvoice = async (request, reply) => {
    try {
        const invoice = await Invoice.findById(request.params.id);
        if (!invoice) return reply.code(404).send({ success: false, message: 'Invoice not found.' });

        const { items, taxRate, discount, paidAmount, ...rest } = request.body;

        if (items) {
            const computedItems = items.map(item => ({ ...item, amount: item.quantity * item.unitPrice }));
            invoice.items = computedItems;
            invoice.subtotal = computedItems.reduce((sum, item) => sum + item.amount, 0);
        }
        if (taxRate !== undefined) {
            invoice.taxRate = taxRate;
            invoice.taxAmount = (invoice.subtotal * taxRate) / 100;
        }
        if (discount !== undefined) invoice.discount = discount;
        invoice.totalAmount = invoice.subtotal + invoice.taxAmount - invoice.discount;
        if (paidAmount !== undefined) invoice.paidAmount = paidAmount;
        invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;

        // Auto-update status
        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.status = 'paid';
            invoice.paidDate = new Date();
        } else if (invoice.paidAmount > 0) {
            invoice.status = 'partial';
        }

        Object.assign(invoice, rest);
        await invoice.save();

        const updated = await Invoice.findById(request.params.id)
            .populate('student', 'fullNameEn phone email')
            .populate('branch', 'name')
            .populate('createdBy', 'fullName');

        return reply.send({ success: true, message: 'Invoice updated successfully.', data: updated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update invoice.' });
    }
};

/**
 * DELETE /invoices/:id
 */
export const deleteInvoice = async (request, reply) => {
    try {
        const invoice = await Invoice.findById(request.params.id);
        if (!invoice) return reply.code(404).send({ success: false, message: 'Invoice not found.' });
        if (invoice.status === 'paid') return reply.code(400).send({ success: false, message: 'Cannot delete a paid invoice.' });

        await Invoice.findByIdAndDelete(request.params.id);
        return reply.send({ success: true, message: 'Invoice deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete invoice.' });
    }
};

/**
 * POST /invoices/:id/record-payment
 * Record a payment against an invoice.
 */
export const recordPayment = async (request, reply) => {
    try {
        const invoice = await Invoice.findById(request.params.id);
        if (!invoice) return reply.code(404).send({ success: false, message: 'Invoice not found.' });

        const { amount, paymentMethod, reference } = request.body;

        invoice.paidAmount += amount;
        invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;
        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.status = 'paid';
            invoice.paidDate = new Date();
        } else {
            invoice.status = 'partial';
        }

        // Auto-create transaction
        const transaction = await Transaction.create({
            item: `Payment for Invoice ${invoice.invoiceNumber}`,
            type: 'income',
            category: 'tuition_fee',
            amount,
            paymentMethod: paymentMethod || 'cash',
            status: 'completed',
            reference: reference || invoice.invoiceNumber,
            student: invoice.student,
            branch: invoice.branch,
            recordedBy: request.user._id,
            date: new Date()
        });

        invoice.transaction = transaction._id;
        await invoice.save();

        return reply.send({ success: true, message: 'Payment recorded successfully.', data: { invoice, transaction } });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to record payment.' });
    }
};

/**
 * GET /invoices/stats
 */
export const getInvoiceStats = async (request, reply) => {
    try {
        const { branch, startDate, endDate } = request.query;
        const match = {};
        if (branch) match.branch = branch;
        if (startDate || endDate) {
            match.issueDate = {};
            if (startDate) match.issueDate.$gte = new Date(startDate);
            if (endDate) match.issueDate.$lte = new Date(endDate);
        }

        const stats = await Invoice.aggregate([
            { $match: match },
            { $group: {
                _id: null,
                totalInvoices: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' },
                totalPaid: { $sum: '$paidAmount' },
                totalDue: { $sum: '$dueAmount' },
                paidCount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
                overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
                draftCount: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } }
            }}
        ]);

        return reply.send({ success: true, data: stats[0] || { totalInvoices: 0, totalAmount: 0, totalPaid: 0, totalDue: 0 } });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch invoice stats.' });
    }
};

/**
 * GET /invoices/export
 */
export const exportInvoices = async (request, reply) => {
    try {
        const invoices = await Invoice.find()
            .populate('student', 'fullNameEn')
            .populate('branch', 'name')
            .populate('createdBy', 'fullName')
            .lean();

        const csvData = invoices.map(i => ({
            'Invoice #': i.invoiceNumber,
            Recipient: i.recipientName,
            Student: i.student?.fullNameEn || 'N/A',
            'Issue Date': new Date(i.issueDate).toLocaleDateString(),
            'Due Date': new Date(i.dueDate).toLocaleDateString(),
            Subtotal: i.subtotal,
            Tax: i.taxAmount,
            Discount: i.discount,
            Total: i.totalAmount,
            Paid: i.paidAmount,
            Due: i.dueAmount,
            Status: i.status,
            Branch: i.branch?.name || 'N/A'
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="invoices.csv"');
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export invoices.' });
    }
};

/**
 * POST /invoices/import
 */
export const importInvoices = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Recipient'] && row['Total']) {
                const invoiceNumber = await generateInvoiceNumber('INV');
                await Invoice.create({
                    invoiceNumber,
                    recipientName: row['Recipient'],
                    recipientEmail: row['Email'] || '',
                    items: [{ description: row['Description'] || 'Imported Item', quantity: 1, unitPrice: parseFloat(row['Total']), amount: parseFloat(row['Total']) }],
                    subtotal: parseFloat(row['Total']),
                    totalAmount: parseFloat(row['Total']),
                    dueAmount: parseFloat(row['Total']) - (parseFloat(row['Paid']) || 0),
                    paidAmount: parseFloat(row['Paid']) || 0,
                    dueDate: row['Due Date'] ? new Date(row['Due Date']) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: row['Status']?.toLowerCase() || 'draft',
                    branch: request.user.branch,
                    createdBy: request.user._id
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported ${created} invoices.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import invoices.' });
    }
};
