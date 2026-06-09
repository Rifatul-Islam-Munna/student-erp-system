import mongoose from 'mongoose';

const documentTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    docType: {
        type: String,
        required: true,
        trim: true,
        enum: ['system', 'student', 'other']
    },
    fileType: {
        type: String,
        trim: true
    },
    originalFilePath: {
        type: String,
        trim: true
    },
    originalFileName: {
        type: String,
        trim: true
    },
    templateContent: {
        type: String,
        default: ''
    },
    shortcodes: {
        type: [String],
        default: []
    },

    description: {
        type: String,
        trim: true
    },
    customFonts: {
        type: [{
            family: {
                type: String,
                required: true,
                trim: true
            },
            label: {
                type: String,
                required: true,
                trim: true
            },
            source: {
                type: String,
                required: true
            }
        }],
        default: []
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive'],
        default: 'draft'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    pageSettings: {
        preset: {
            type: String,
            enum: ['A4', 'A3', 'Letter', 'Legal', 'Custom'],
            default: 'A4'
        },
        orientation: {
            type: String,
            enum: ['portrait', 'landscape'],
            default: 'portrait'
        },
        widthMm: {
            type: Number,
            default: 210
        },
        heightMm: {
            type: Number,
            default: 297
        },
        marginTopMm: {
            type: Number,
            default: 16
        },
        marginRightMm: {
            type: Number,
            default: 16
        },
        marginBottomMm: {
            type: Number,
            default: 16
        },
        marginLeftMm: {
            type: Number,
            default: 16
        }
    }
}, {
    timestamps: true
});

const DocumentTemplate = mongoose.model('DocumentTemplate', documentTemplateSchema);

export default DocumentTemplate;
