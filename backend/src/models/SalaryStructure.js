import mongoose from 'mongoose';

const salaryStructureSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    basicSalary: {
        type: Number,
        required: true,
        default: 0
    },
    allowances: [{
        label: { type: String, required: true },
        amount: { type: Number, required: true }
    }],
    deductions: [{
        label: { type: String, required: true },
        amount: { type: Number, required: true }
    }]
}, {
    timestamps: true
});

// Virtual for Net Salary calculation
salaryStructureSchema.virtual('netSalary').get(function() {
    const totalAllowances = this.allowances.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = this.deductions.reduce((sum, item) => sum + item.amount, 0);
    return this.basicSalary + totalAllowances - totalDeductions;
});

salaryStructureSchema.set('toJSON', { virtuals: true });
salaryStructureSchema.set('toObject', { virtuals: true });

const SalaryStructure = mongoose.model('SalaryStructure', salaryStructureSchema);

export default SalaryStructure;
