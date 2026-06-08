import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['call', 'email', 'sms', 'whatsapp', 'facebook', 'instagram', 'other'],
        required: true,
        lowercase: true
    },
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['connected', 'missed', 'busy', 'failed', 'sent', 'received', 'pending'],
        required: true,
        lowercase: true
    },
    summary: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    details: {
        type: String,
        trim: true,
        default: ''
    },
    duration: {
        type: Number, // duration in seconds
        default: 0
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    },
    visitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor',
        default: null
    },
    assignedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for performance
communicationLogSchema.index({ student: 1 });
communicationLogSchema.index({ visitor: 1 });
communicationLogSchema.index({ type: 1 });
communicationLogSchema.index({ dateTime: -1 });

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);

export default CommunicationLog;
