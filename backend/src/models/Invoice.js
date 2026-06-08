import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 }
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    },
    partnerAgency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PartnerAgency',
        default: null
    },
    recipientName: {
        type: String,
        required: true,
        trim: true
    },
    recipientEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    recipientPhone: {
        type: String,
        trim: true,
        default: null
    },
    recipientAddress: {
        type: String,
        trim: true,
        default: ''
    },
    items: {
        type: [invoiceItemSchema],
        required: true,
        validate: [arr => arr.length > 0, 'At least one item is required']
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    taxRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    dueAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
        default: 'draft',
        lowercase: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes

invoiceSchema.index({ student: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ branch: 1 });
invoiceSchema.index({ issueDate: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
