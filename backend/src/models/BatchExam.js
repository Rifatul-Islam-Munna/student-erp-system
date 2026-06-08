import mongoose from 'mongoose';

const batchExamSchema = new mongoose.Schema({
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    examType: { type: String, required: true, trim: true },
    level: { type: String, trim: true },
    examDate: { type: Date, required: true },
    totalMarks: { type: Number },
    description: { type: String, trim: true }
}, {
    timestamps: true
});

const BatchExam = mongoose.model('BatchExam', batchExamSchema);

export default BatchExam;
