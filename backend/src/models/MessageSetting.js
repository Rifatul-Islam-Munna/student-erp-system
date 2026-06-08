import mongoose from 'mongoose';

const smtpGatewaySchema = new mongoose.Schema({
    provider: { type: String, required: true }, // e.g. SendGrid, Mailgun, Custom
    host: { type: String, required: true },
    port: { type: Number, required: true },
    user: { type: String, required: true },
    pass: { type: String, required: true },
    fromEmail: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const smsGatewaySchema = new mongoose.Schema({
    provider: { type: String, required: true }, // e.g. Twilio, Plivo
    apiKey: { type: String, required: true },
    apiSecret: { type: String, default: '' }, // Some providers use sid + token, others just key
    senderId: { type: String, required: true }, // From number or sender ID
    isDefault: { type: Boolean, default: false }
});

const messageSettingSchema = new mongoose.Schema({
    rolePermissions: {
        super_admin: {
            emailEnabled: { type: Boolean, default: true },
            smsEnabled: { type: Boolean, default: true }
        },
        admin: {
            emailEnabled: { type: Boolean, default: false },
            smsEnabled: { type: Boolean, default: false }
        },
        branch: {
            emailEnabled: { type: Boolean, default: false },
            smsEnabled: { type: Boolean, default: false }
        }
    },
    emailGateways: [smtpGatewaySchema],
    smsGateways: [smsGatewaySchema]
}, {
    timestamps: true
});

const MessageSetting = mongoose.model('MessageSetting', messageSettingSchema);

export default MessageSetting;
