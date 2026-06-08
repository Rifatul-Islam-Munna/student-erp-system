import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    site: {
        name: { type: String, default: 'AgencyBook' },
        logo: { type: String, default: null },
        address: { type: String, default: null },
        phone: { type: String, default: null },
        email: { type: String, default: null },
        maintenance_mode: { type: Boolean, default: false },
        maintenance_message: { type: String, default: 'System under maintenance' },
        academic_year: { type: String, default: '2025-2026' }
    },
    intake_months: { type: [String], default: [] },
    visatypes: [{
        name: { type: String, trim: true },
        subname: { type: String, trim: true },
        slug: { type: String, trim: true },
        description: { type: String, trim: true }
    }],
    visiting_sources: { type: [String], default: [] },
    edu_degrees: { type: [String], default: [] },
    exam_types: [{
        name: { type: String, trim: true },
        subname: { type: String, trim: true },
        slug: { type: String, trim: true },
        description: { type: String, trim: true }
    }],
    countries: [{
        name: { type: String, trim: true },
        logoUrl: { type: String, trim: true },
        logoFile: { type: String, trim: true }
    }],
    event_categories: { type: [String], default: [] },
    faq_categories: { type: [String], default: [] }
}, {
    timestamps: true
});

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
