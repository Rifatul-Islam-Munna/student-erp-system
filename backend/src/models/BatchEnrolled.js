import mongoose from 'mongoose';

const batchEnrolledSchema = new mongoose.Schema({
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'dropped', 'transferred'], default: 'active' },
    internalNotes: { type: String, trim: true }
}, {
    timestamps: true
});

batchEnrolledSchema.index({ batch: 1, student: 1 }, { unique: true });

const BatchEnrolled = mongoose.model('BatchEnrolled', batchEnrolledSchema);

export default BatchEnrolled;
