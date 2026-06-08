import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    messageType: {
        type: String,
        enum: ['email', 'sms'],
        required: true
    },
    recipientEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
    },
    recipientPhone: {
        type: String,
        trim: true,
        default: null
    },
    subject: {
        type: String, // mostly for email
        trim: true,
        default: null
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'draft'],
        default: 'pending'
    },
    gatewayUsed: {
        type: String,
        trim: true,
        default: null // The name of the provider used to send
    },
    senderRole: {
        type: String,
        enum: ['super_admin', 'admin', 'branch'],
        required: true
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Store gateway response or error
        default: {}
    },
    sentAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

messageSchema.index({ sentBy: 1 });
messageSchema.index({ branchId: 1 });
messageSchema.index({ messageType: 1, status: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
