import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
    examName: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    board: { type: String, required: true, trim: true },
    gpa: { type: Number, required: true },
    groupSubject: { type: String, required: true, trim: true }
}, { _id: true });

const japaneseTestSchema = new mongoose.Schema({
    hasCertificate: { type: Boolean, default: false },
    examType: { type: String, trim: true },
    level: { type: String, trim: true },
    score: { type: String, trim: true }
}, { _id: false });

const visitorSchema = new mongoose.Schema({
    // Personal Information
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    phone: { type: String, required: true, trim: true },
    guardianPhone: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    
    // Education Info
    education: [educationSchema],

    // Japanese Test (Nested Object)
    JapaneseTest: { type: japaneseTestSchema, default: () => ({ hasCertificate: false }) },

    // Visa Information 
    visaType: { type: String, trim: true }, // Renamed from visaCategory

    // Country & Visa 
    preferredCountry: { type: [String], default: [] },
    intake: { type: String, trim: true },
    BudgetConcerned: { type: Boolean, default: false }, // Renamed from interestedInLanguageSchool

    // Course Information
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }, // Changed from String
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    partnerAgency: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerAgency', default: null },
    source: { type: String, trim: true }, // Added
    counselor: { type: String, trim: true }, // Added
    courseType: { type: String, trim: true },
    courseName: { type: String, trim: true },
    preferredDate: { type: Date },
    counselingNote: { type: String, trim: true },

    // Lead Scoring & Follow-up (Feature #15)
    status: {
        type: String,
        enum: ['new', 'contacted', 'interested', 'follow_up', 'converted', 'lost', 'inactive'],
        default: 'new',
        lowercase: true
    },
    leadScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    leadCategory: {
        type: String,
        enum: ['hot', 'warm', 'cold', 'unscored'],
        default: 'unscored',
        lowercase: true
    },
    followUpDates: [{
        date: { type: Date },
        note: { type: String, trim: true },
        completedAt: { type: Date, default: null }
    }],
    lastFollowUp: {
        type: Date,
        default: null
    },
    nextFollowUp: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
