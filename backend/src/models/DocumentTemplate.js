import mongoose from 'mongoose';

const documentTemplateSchema = new mongoose.Schema({
    // Template metadata
    name: {
        type: String,
        required: true,
        trim: true
    },
    docType: {
        type: String,
        required: true,
        trim: true
        // e.g. 'birth_certificate', 'enrollment_letter', 'admission_form', 'payment_receipt', etc.
    },
    fileType: {
        type: String,
        trim: true
        // e.g. 'pdf', 'psd', 'ai', 'csv', 'xlsx'
    },

    // Original uploaded template file path
    originalFilePath: {
        type: String,
        trim: true
    },
    originalFileName: {
        type: String,
        trim: true
    },

    // HTML content with shortcodes for PDF generation
    // e.g. "<h1>{{ name }}</h1><p>DOB: {{ dob }}</p>"
    templateContent: {
        type: String,
        default: ''
    },

    // Shortcodes used in this template (for reference)
    shortcodes: {
        type: [String],
        default: []
    },

    description: {
        type: String,
        trim: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const DocumentTemplate = mongoose.model('DocumentTemplate', documentTemplateSchema);

export default DocumentTemplate;
