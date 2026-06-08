import mongoose from 'mongoose';

const batchExamResultSchema = new mongoose.Schema({
    batchExam: { type: mongoose.Schema.Types.ObjectId, ref: 'BatchExam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    score: { type: String, required: true, trim: true },
    result: { type: String, enum: ['Pass', 'Fail', 'Pending', ''], required: true },
    remarks: { type: String, trim: true }
}, {
    timestamps: true
});

batchExamResultSchema.index({ batchExam: 1, student: 1 }, { unique: true });

const BatchExamResult = mongoose.model('BatchExamResult', batchExamResultSchema);

export default BatchExamResult;
