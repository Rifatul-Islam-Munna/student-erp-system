import mongoose from 'mongoose';

const workflowRuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    // Trigger configuration
    triggerEvent: {
        type: String,
        enum: [
            'visitor_created', 'visitor_updated',
            'student_created', 'student_updated',
            'submission_status_changed', 'coe_approved', 'visa_approved',
            'payment_received', 'invoice_created', 'invoice_overdue',
            'task_created', 'task_deadline_passed',
            'batch_enrollment',
            'visa_status_changed'
        ],
        required: true,
        lowercase: true
    },
    // Conditions (when to fire)
    conditions: [{
        field: { type: String, trim: true },
        operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in'] },
        value: { type: mongoose.Schema.Types.Mixed }
    }],
    // Actions to perform
    actions: [{
        type: {
            type: String,
            enum: ['send_notification', 'send_email', 'send_sms', 'assign_user', 'update_field', 'create_task', 'log_communication'],
            required: true
        },
        config: { type: mongoose.Schema.Types.Mixed, default: {} }
    }],
    // Assignment strategy for assign_user action
    assignmentStrategy: {
        type: String,
        enum: ['round_robin', 'least_loaded', 'manual', ''],
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    executionCount: {
        type: Number,
        default: 0
    },
    lastExecutedAt: {
        type: Date,
        default: null
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null
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
workflowRuleSchema.index({ triggerEvent: 1, isActive: 1 });
workflowRuleSchema.index({ branch: 1 });

const WorkflowRule = mongoose.model('WorkflowRule', workflowRuleSchema);

export default WorkflowRule;
