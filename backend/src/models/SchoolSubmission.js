import mongoose from 'mongoose';

const schoolSubmissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    intake: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Submitted', 'Interview Scheduled', 'COE Approved', 'Visa Approved', 'Rejected'],
        default: 'Pending'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    },
    internalRemarks: {
        type: String,
        trim: true
    },
    // Pipeline/Kanban enhancements (Feature #4)
    statusHistory: [{
        status: { type: String },
        date: { type: Date, default: Date.now },
        notes: { type: String, trim: true, default: '' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    deadline: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        lowercase: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Prevent duplicate applications for the same intake
schoolSubmissionSchema.index({ student: 1, school: 1, intake: 1 }, { unique: true });

const SchoolSubmission = mongoose.model('SchoolSubmission', schoolSubmissionSchema);

export default SchoolSubmission;
