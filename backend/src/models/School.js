import mongoose from 'mongoose';

const intakeSchema = new mongoose.Schema({
    month: { type: String, required: true },
    deadline: { type: Date },
    minJlptLevel: { type: String, trim: true },
    minEducation: { type: String, trim: true },
    minGpaSsc: { type: Number },
    minGpaHsc: { type: Number },
    minAge: { type: Number },
    maxAge: { type: Number }
}, { _id: true });

const schoolSchema = new mongoose.Schema({
    // Basic Info
    nameEn: { type: String, required: true, trim: true },
    nameJp: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    website: { type: String, trim: true },
    driveLink: { type: String, trim: true },

    // Contact
    contactPerson: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    // Fees & Requirements
    shokaiFee: { type: Number, default: 0 },
    tuitionYear1: { type: Number, default: 0 },
    tuitionYear2: { type: Number, default: 0 },
    admissionFee: { type: Number, default: 0 },
    interviewType: { type: String, trim: true },
    region: { type: String, trim: true },
    immigrationBureau: { type: [String], default: [] },
    hasDormitory: { type: Boolean, default: false },

    // Intakes
    intakeMonths: { type: [String], default: [] }, // Months selected
    intakes: [intakeSchema], // Details per month

    // Notes
    notes: { type: String, trim: true },

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null
    }
}, {
    timestamps: true
});

const School = mongoose.model('School', schoolSchema);

export default School;
