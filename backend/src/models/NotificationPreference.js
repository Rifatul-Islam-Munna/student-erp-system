import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Per-type toggles
    enabledTypes: {
        task_assigned: { type: Boolean, default: true },
        task_deadline: { type: Boolean, default: true },
        status_change: { type: Boolean, default: true },
        payment_received: { type: Boolean, default: true },
        submission_update: { type: Boolean, default: true },
        system: { type: Boolean, default: true },
        reminder: { type: Boolean, default: true },
        announcement: { type: Boolean, default: true }
    },
    // Email digest preference
    emailDigest: {
        type: String,
        enum: ['none', 'daily', 'weekly'],
        default: 'none',
        lowercase: true
    },
    // Sound preference
    playSound: {
        type: Boolean,
        default: true
    },
    // Desktop/push notification preference
    pushEnabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});



const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

export default NotificationPreference;
