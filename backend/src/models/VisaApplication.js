import mongoose from 'mongoose';

const visaChecklistItemSchema = new mongoose.Schema({
    item: { type: String, required: true, trim: true },
    isCompleted: { type: Boolean, default: false },
    completedDate: { type: Date, default: null },
    notes: { type: String, trim: true, default: '' }
}, { _id: true });

const visaApplicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    schoolSubmission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolSubmission',
        default: null
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        default: null
    },
    visaType: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: [
            'Document Collection',
            'Translation',
            'Embassy Submission',
            'Biometrics',
            'Interview Scheduled',
            'Interview Done',
            'Under Review',
            'Decision Pending',
            'Visa Approved',
            'Visa Rejected',
            'Visa Issued',
            'Travel Date Set'
        ],
        default: 'Document Collection'
    },
    statusHistory: [{
        status: { type: String },
        date: { type: Date, default: Date.now },
        notes: { type: String, trim: true, default: '' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    checklist: {
        type: [visaChecklistItemSchema],
        default: []
    },
    embassyAppointment: {
        date: { type: Date, default: null },
        time: { type: String, trim: true, default: '' },
        location: { type: String, trim: true, default: '' },
        referenceNumber: { type: String, trim: true, default: '' }
    },
    visaFee: {
        type: Number,
        default: 0,
        min: 0
    },
    visaFeeTransaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null
    },
    passportNumber: {
        type: String,
        trim: true,
        default: ''
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
    decisionDate: {
        type: Date,
        default: null
    },
    travelDate: {
        type: Date,
        default: null
    },
    visaNumber: {
        type: String,
        trim: true,
        default: ''
    },
    visaExpiryDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    internalRemarks: {
        type: String,
        trim: true,
        default: ''
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
visaApplicationSchema.index({ student: 1 });
visaApplicationSchema.index({ status: 1 });
visaApplicationSchema.index({ country: 1 });
visaApplicationSchema.index({ branch: 1 });
visaApplicationSchema.index({ applicationDate: -1 });

const VisaApplication = mongoose.model('VisaApplication', visaApplicationSchema);

export default VisaApplication;
