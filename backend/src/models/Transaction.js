import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
        lowercase: true
    },
    category: {
        type: String,
        enum: ['tuition_fee', 'admission_fee', 'commission', 'salary', 'rent', 'utility', 'marketing', 'office_supply', 'other'],
        required: true,
        lowercase: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'bkash', 'nagad', 'rocket', 'card', 'other'],
        required: true,
        lowercase: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        default: null
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    isTaxable: {
        type: Boolean,
        default: false
    },
    transactionType: {
        type: String,
        enum: ['income', 'expense', 'tax_payment', 'transfer'],
        default: 'income',
        lowercase: true
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'cancelled'],
        default: 'completed',
        lowercase: true
    },
    reference: {
        type: String,
        trim: true,
        default: ''
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    partnerAgency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PartnerAgency',
        default: null
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for performance
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ branch: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
