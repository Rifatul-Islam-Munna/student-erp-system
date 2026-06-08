import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'application'
    },
    message: {
        type: String,
        required: true
    },
    stack: String,
    file: String,
    method: String,
    path: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    serverInfo: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});

// Auto-expire logs after 30 days
errorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

export default ErrorLog;
