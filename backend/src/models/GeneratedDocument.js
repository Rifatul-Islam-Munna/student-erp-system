import mongoose from 'mongoose';

const generatedDocumentSchema = new mongoose.Schema({
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocumentTemplate',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    },
    filePath: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        default: 'text/html; charset=utf-8'
    },
    fileExtension: {
        type: String,
        default: 'html'
    },
    downloadToken: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// TTL index to auto-delete expired documents after 1 hour past expiry
generatedDocumentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

const GeneratedDocument = mongoose.model('GeneratedDocument', generatedDocumentSchema);

export default GeneratedDocument;
