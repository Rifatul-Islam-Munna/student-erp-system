import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    totalAllowances: {
        type: Number,
        default: 0
    },
    totalDeductions: {
        type: Number,
        default: 0
    },
    attendanceDeduction: {
        type: Number,
        default: 0
    },
    netPayable: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'partially_paid'],
        default: 'unpaid',
        lowercase: true
    },
    paymentDate: {
        type: Date,
        default: null
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null
    }
}, {
    timestamps: true
});

// Ensure only one payroll record per staff per month/year
payrollSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;
