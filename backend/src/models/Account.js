import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'asset', 'liability', 'equity'],
        required: true,
        lowercase: true
    },
    code: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null
    }
}, {
    timestamps: true
});

// Indexes for performance
accountSchema.index({ type: 1 });
accountSchema.index({ isActive: 1 });
accountSchema.index({ branch: 1 });

const Account = mongoose.model('Account', accountSchema);

export default Account;
