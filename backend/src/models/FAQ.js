import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null // null if global FAQ
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for performance
faqSchema.index({ category: 1 });
faqSchema.index({ branch: 1 });
faqSchema.index({ question: 'text' }); // For search

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ;
