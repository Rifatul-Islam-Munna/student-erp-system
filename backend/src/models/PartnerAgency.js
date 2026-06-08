import mongoose from 'mongoose';

const partnerAgencySchema = new mongoose.Schema({
    agencyName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['agent', 'sub-agent', 'corporate', 'other'],
        default: 'agent',
        lowercase: true
    },
    commissionRate: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for performance
partnerAgencySchema.index({ branch: 1 });
partnerAgencySchema.index({ type: 1 });
partnerAgencySchema.index({ isActive: 1 });

const PartnerAgency = mongoose.model('PartnerAgency', partnerAgencySchema);

export default PartnerAgency;
