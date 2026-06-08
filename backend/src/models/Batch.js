import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    batchName: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    level: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    maxStudents: {
        type: Number,
        min: 1
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        default: null
    },
    classDays: {
        type: [String],
        default: [],
        enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    classTime: {
        type: String,
        trim: true
    },
    classDuration: {
        type: Number,
        min: 0.5
    }
}, {
    timestamps: true
});

const Batch = mongoose.model('Batch', batchSchema);

export default Batch;
