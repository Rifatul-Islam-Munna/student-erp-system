import mongoose from 'mongoose';

const employeeProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    joiningDate: {
        type: Date,
        required: true
    },
    emergencyContact: {
        type: String,
        trim: true
    },
    bankDetails: {
        accountNo: { type: String, trim: true },
        bankName: { type: String, trim: true },
        branchName: { type: String, trim: true },
        routingNo: { type: String, trim: true }
    }
}, {
    timestamps: true
});

const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema);

export default EmployeeProfile;
