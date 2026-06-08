import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
    educationKey: { type: String, trim: true },
    degreeExam: { type: String, trim: true }, // legacy
    level: { type: String, trim: true },
    institutionName: { type: String, trim: true }, // legacy
    institution: { type: String, trim: true },
    passingYear: { type: Number }, // legacy
    year: { type: Number },
    board: { type: String, trim: true },
    gpa: { type: Number },
    groupSubject: { type: String, trim: true }, // legacy
    group: { type: String, trim: true },
    durationMonths: { type: Number },
    expectedScheduleYear: { type: Number },
    expectedScheduleMonths: { type: Number },
    examConductedYear: { type: Number },
    examConductedMonths: { type: Number },
    courseName: { type: String, trim: true },
    subjectName: { type: String, trim: true },
    courseUnderInstitution: { type: String, trim: true },
    institutionBoard: { type: String, trim: true },
    institutionCollege: { type: String, trim: true },
    institutionUniversity: { type: String, trim: true },
    institutionNationalUniversity: { type: String, trim: true },
    institutionPrivateUniversity: { type: String, trim: true },
    institutionDhakaUniversity: { type: String, trim: true },
    completionYear: { type: Number },
    completionMonth: { type: Number },
    address: { type: String, trim: true },
    entranceDate: { type: Date },
    graduationDate: { type: Date }
}, { _id: true });

const employmentSchema = new mongoose.Schema({
    companyName: { type: String, trim: true },
    address: { type: String, trim: true },
    jobTitle: { type: String, trim: true }, // legacy
    position: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date }
}, { _id: true });

const japaneseEducationSchema = new mongoose.Schema({
    languageKey: { type: String, trim: true },
    instituteName: { type: String, trim: true },
    preferredInstituteName: { type: String, trim: true },
    address: { type: String, trim: true },
    fromDate: { type: Date },
    toDate: { type: Date },
    totalHours: { type: Number },
    durationMonths: { type: Number },
    attendancePercentage: { type: Number },
    grade: { type: String, trim: true }
}, { _id: true });

const japaneseTestSchema = new mongoose.Schema({
    examType: { type: String, trim: true },
    level: { type: String, trim: true },
    examDate: { type: Date },
    score: { type: String, trim: true },
    result: { type: String, enum: ['Pass', 'Fail', 'Pending', ''] }
}, { _id: true });

const studentSchema = new mongoose.Schema({
    // Personal Information
    fullNameEn: { type: String, required: true, trim: true },
    nameKatakana: { type: String, trim: true },
    name_bd: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    lineapp: { type: String, trim: true },
    facebookprofile: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed', ''], default: 'single' },
    nationality: { type: String, trim: true },
    birth_place: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    nationalId: { type: String, trim: true }, // legacy
    passportNo: { type: String, trim: true }, // legacy
    passportIssueDate: { type: Date },
    passportExpiryDate: { type: Date },
    bc_date_of_registration: { type: Date },
    bc_date_of_issuance: { type: Date },
    occupation: { type: String, trim: true },
    spouseName: { type: String, trim: true },
    father_name_en: { type: String, trim: true },
    mother_name_en: { type: String, trim: true },
    sponsor_name_en: { type: String, trim: true },
    sponsor_relationship: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    emergencyPhone: { type: String, trim: true },
    permanentAddress: { type: String, trim: true },
    currentAddressSameAsPermanent: { type: Boolean, default: false },
    currentAddress: { type: String, trim: true },

    // Repeaters Arrays
    education: { type: [educationSchema], default: [] },
    employment: { type: [employmentSchema], default: [] },
    languageEducation: { type: [japaneseEducationSchema], default: [] },
    languageTest: { type: [japaneseTestSchema], default: [] },

    // Study Information
    visaType: { type: String, trim: true },
    country: { type: String, trim: true },
    schoolName: { type: String, trim: true }, // legacy
    intake: { type: String, trim: true },
    expectedIntake: { type: String, trim: true },
    source: { type: String, trim: true },
    status: { type: String, trim: true },
    applicationType: { type: String, trim: true }, // e.g., Walk-in, Referral
    studentType: { type: String, enum: ['own', 'partner'], default: 'own' },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    partnerAgency: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerAgency', default: null },
    counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // File Input
    googleDriveLink: { type: String, trim: true },
    internalNotes: { type: String, trim: true },
    docVariables: {
        type: Map,
        of: String,
        default: {}
    },
    explanationChecks: {
        type: Map,
        of: Boolean,
        default: {}
    }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
