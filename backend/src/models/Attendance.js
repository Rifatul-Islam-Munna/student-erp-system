import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'leave'],
        required: true,
        default: 'present'
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index to ensure one record per student per batch per day
// Using numeric representation for the date or normalizing the date to YYYY-MM-DD
// But for now, we'll assume the controller handles normalizing the date to 00:00:00
attendanceSchema.index({ batch: 1, student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
