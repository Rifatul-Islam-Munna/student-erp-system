import mongoose from 'mongoose';

const staffAttendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'leave', 'holiday', 'half_day'],
        required: true,
        lowercase: true
    },
    checkIn: {
        type: String,
        trim: true
    },
    checkOut: {
        type: String,
        trim: true
    },
    remarks: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Ensure one record per staff per day
staffAttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const StaffAttendance = mongoose.model('StaffAttendance', staffAttendanceSchema);

export default StaffAttendance;
