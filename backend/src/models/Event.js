import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null // null if global event
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'cancelled', 'completed'],
        default: 'scheduled',
        lowercase: true
    }
}, {
    timestamps: true
});

// Indexes for performance (especially for calendar range queries)
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ branch: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
