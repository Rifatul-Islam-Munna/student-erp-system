import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        trim: true,
        default: null
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'counselor', 'agent', 'student', 'branch', 'teacher'],
        required: true,
        default: 'student'
    },
    avatar: {
        type: String,
        default: null
    },
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    permissions: {
        type: [String],
        default: []
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    lastLoginIp: {
        type: String,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
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

    // Agent/Counselor specific fields
    address: {
        type: String,
        trim: true,
        default: null
    },
    commissionType: {
        type: String,
        enum: ['fixed', 'percentage', ''],
        default: ''
    },
    commissionAmount: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
};

// Default permissions by role
userSchema.statics.getDefaultPermissions = function (role) {
    const permissionsMap = {
        super_admin: [
            'view_users',
            'manage_users',
            'manage_admins',
            'manage_teachers',
            'view_teachers',
            'manage_students',
            'manage_branches',
            'manage_batches',
            'manage_classes',
            'manage_subjects',
            'manage_attendance',
            'manage_salary',
            'manage_fees',
            'manage_exams',
            'manage_notices',
            'manage_settings',
            'view_reports',
            'manage_uploads',
            'view_accounts',
            'manage_accounts',
            'view_financial_reports',
            'export_financial_data',
            'view_partner_agencies',
            'manage_partner_agencies',
            'export_partner_agencies',
            'view_agency_reports',
            // New feature permissions
            'view_dashboard',
            'view_audit_logs',
            'manage_audit_logs',
            'view_notifications',
            'manage_notifications',
            'view_invoices',
            'manage_invoices',
            'export_invoices',
            'view_visa_applications',
            'manage_visa_applications',
            'export_visa_applications',
            'view_targets',
            'manage_targets',
            'export_targets',
            'view_workflows',
            'manage_workflows',
            'view_lead_scores',
            'manage_lead_scores',
            'view_pipeline',
            'manage_pipeline'
        ],
        admin: [
            'view_users',
            'manage_users',
            'view_teachers',
            'manage_teachers',
            'manage_students',
            'manage_branches',
            'manage_classes',
            'manage_subjects',
            'manage_attendance',
            'manage_salary',
            'manage_fees',
            'manage_exams',
            'manage_notices',
            'view_reports',
            'manage_uploads',
            'view_accounts',
            'manage_accounts',
            'view_financial_reports',
            'export_financial_data',
            'view_partner_agencies',
            'manage_partner_agencies',
            'export_partner_agencies',
            'view_agency_reports',
            // New feature permissions
            'view_dashboard',
            'view_audit_logs',
            'view_notifications',
            'manage_notifications',
            'view_invoices',
            'manage_invoices',
            'export_invoices',
            'view_visa_applications',
            'manage_visa_applications',
            'export_visa_applications',
            'view_targets',
            'manage_targets',
            'export_targets',
            'view_workflows',
            'manage_workflows',
            'view_lead_scores',
            'view_pipeline',
            'manage_pipeline'
        ],
        student: [
            'view_own_profile',
            'view_own_attendance',
            'view_own_fees',
            'view_own_results',
            'view_notices',
            'view_notifications'
        ],
        branch: [
            'view_branch_students',
            'manage_branch_attendance',
            'view_branch_results',
            'view_notices',
            'view_dashboard',
            'view_notifications',
            'view_invoices',
            'view_visa_applications',
            'view_targets'
        ],
        counselor: [
            'view_students',
            'manage_students',
            'view_visitors',
            'manage_visitors',
            'view_batches',
            'view_school_submissions',
            'view_attendance',
            'view_reports',
            'view_dashboard',
            'view_notifications',
            'view_visa_applications',
            'manage_visa_applications',
            'view_lead_scores',
            'view_pipeline',
            'manage_pipeline'
        ],
        agent: [
            'view_students',
            'view_school_submissions',
            'view_reports',
            'view_notifications',
            'view_targets',
            'view_visa_applications'
        ]
    };
    return permissionsMap[role] || [];
};

const User = mongoose.model('User', userSchema);

export default User;
