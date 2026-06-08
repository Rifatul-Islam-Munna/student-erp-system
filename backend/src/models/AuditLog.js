import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    entityType: {
        type: String,
        required: true,
        trim: true
        // e.g. 'Student', 'Visitor', 'Transaction', 'User', etc.
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    action: {
        type: String,
        enum: ['create', 'update', 'delete'],
        required: true,
        lowercase: true
    },
    changes: {
        // Field-level before/after diff for updates
        type: [{
            field: { type: String },
            oldValue: { type: mongoose.Schema.Types.Mixed },
            newValue: { type: mongoose.Schema.Types.Mixed }
        }],
        default: []
    },
    snapshot: {
        // Full document snapshot for create/delete actions
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    performedByName: {
        type: String,
        trim: true,
        default: 'System'
    },
    ipAddress: {
        type: String,
        trim: true,
        default: null
    },
    userAgent: {
        type: String,
        trim: true,
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for performance
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
