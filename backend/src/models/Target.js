import mongoose from 'mongoose';

const targetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    metric: {
        type: String,
        enum: ['students_enrolled', 'revenue_collected', 'submissions_made', 'visitors_converted', 'visa_approved', 'custom'],
        required: true,
        lowercase: true
    },
    targetValue: {
        type: Number,
        required: true,
        min: 0
    },
    currentValue: {
        type: Number,
        default: 0,
        min: 0
    },
    period: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        required: true,
        lowercase: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assignedRole: {
        type: String,
        enum: ['agent', 'counselor', 'branch', 'admin', ''],
        default: ''
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'exceeded', 'missed', 'cancelled'],
        default: 'active',
        lowercase: true
    },
    achievementPercentage: {
        type: Number,
        default: 0,
        min: 0
    },
    // Incentive configuration
    incentive: {
        type: {
            type: String,
            enum: ['fixed', 'percentage', 'bonus', ''],
            default: ''
        },
        amount: { type: Number, default: 0 },
        description: { type: String, trim: true, default: '' }
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
targetSchema.index({ assignedTo: 1, period: 1, status: 1 });
targetSchema.index({ branch: 1 });
targetSchema.index({ metric: 1 });
targetSchema.index({ startDate: 1, endDate: 1 });
targetSchema.index({ status: 1 });

const Target = mongoose.model('Target', targetSchema);

export default Target;
