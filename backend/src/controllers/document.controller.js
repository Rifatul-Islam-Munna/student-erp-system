import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import DocumentTemplate from '../models/DocumentTemplate.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import Student from '../models/Student.js';
import logger from '../services/logger.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads/templates');
const GENERATED_DIR = path.join(__dirname, '../../uploads/generated');

// --- SHORTCODE MAPPING ---
const SHORTCODE_MAP = {
    '{{ name }}': 'fullNameEn',
    '{{ name_katakana }}': 'nameKatakana',
    '{{ email }}': 'email',
    '{{ phone }}': 'phone',
    '{{ whatsapp }}': 'whatsapp',
    '{{ guardian_phone }}': 'guardianPhone',
    '{{ dob }}': 'dob',
    '{{ gender }}': 'gender',
    '{{ marital_status }}': 'maritalStatus',
    '{{ nationality }}': 'nationality',
    '{{ blood_group }}': 'bloodGroup',
    '{{ national_id }}': 'nationalId',
    '{{ passport_no }}': 'passportNo',
    '{{ passport_issue_date }}': 'passportIssueDate',
    '{{ passport_expiry_date }}': 'passportExpiryDate',
    '{{ occupation }}': 'occupation',
    '{{ spouse_name }}': 'spouseName',
    '{{ emergency_contact }}': 'emergencyContact',
    '{{ emergency_phone }}': 'emergencyPhone',
    '{{ permanent_address }}': 'permanentAddress',
    '{{ current_address }}': 'currentAddress',
    '{{ visa_type }}': 'visaType',
    '{{ country }}': 'country',
    '{{ intake }}': 'intake',
    '{{ expected_intake }}': 'expectedIntake',
    '{{ source }}': 'source',
    '{{ student_type }}': 'studentType'
};

function resolveShortcodes(text, studentData) {
    if (!text) return '';
    let result = text;
    for (const [shortcode, field] of Object.entries(SHORTCODE_MAP)) {
        let value = studentData[field];
        if (value instanceof Date) {
            value = value.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        result = result.replaceAll(shortcode, value || '');
    }
    return result;
}

// --- TEMPLATE CRUD ---

export const getAllTemplates = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, docType, isActive } = request.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { docType: { $regex: search, $options: 'i' } }
            ];
        }
        if (docType) query.docType = docType;
        if (typeof isActive === 'boolean') query.isActive = isActive;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [templates, total] = await Promise.all([
            DocumentTemplate.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            DocumentTemplate.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: templates,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch templates.' });
    }
};

export const getTemplateById = async (request, reply) => {
    try {
        const template = await DocumentTemplate.findById(request.params.id);
        if (!template) return reply.code(404).send({ success: false, message: 'Template not found.' });
        return reply.code(200).send({ success: true, data: template });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to find template.' });
    }
};

export const createTemplate = async (request, reply) => {
    try {
        const template = await DocumentTemplate.create(request.body);
        return reply.code(201).send({ success: true, message: 'Template created successfully.', data: template });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create template.' });
    }
};

export const updateTemplate = async (request, reply) => {
    try {
        const template = await DocumentTemplate.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
        if (!template) return reply.code(404).send({ success: false, message: 'Template not found.' });
        return reply.send({ success: true, message: 'Template updated successfully.', data: template });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update template.' });
    }
};

export const deleteTemplate = async (request, reply) => {
    try {
        const template = await DocumentTemplate.findByIdAndDelete(request.params.id);
        if (!template) return reply.code(404).send({ success: false, message: 'Template not found.' });

        // Remove uploaded file if exists
        if (template.originalFilePath && fs.existsSync(template.originalFilePath)) {
            fs.unlinkSync(template.originalFilePath);
        }

        return reply.send({ success: true, message: 'Template deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete template.' });
    }
};

// --- FILE UPLOAD ---

export const uploadTemplateFile = async (request, reply) => {
    try {
        const { id } = request.params;
        const template = await DocumentTemplate.findById(id);
        if (!template) return reply.code(404).send({ success: false, message: 'Template not found.' });

        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        const ext = path.extname(data.filename).toLowerCase();
        const safeName = `${template._id}_${Date.now()}${ext}`;
        const filePath = path.join(UPLOAD_DIR, safeName);

        // Save file to disk
        const writeStream = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
            data.file.pipe(writeStream);
            data.file.on('end', resolve);
            data.file.on('error', reject);
        });

        // Remove old file if exists
        if (template.originalFilePath && fs.existsSync(template.originalFilePath)) {
            fs.unlinkSync(template.originalFilePath);
        }

        template.originalFilePath = filePath;
        template.originalFileName = data.filename;
        template.fileType = ext.replace('.', '');
        await template.save();

        return reply.send({ success: true, message: 'File uploaded successfully.', data: template });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to upload file.' });
    }
};

// --- PDF GENERATION WITH SHORTCODE REPLACEMENT ---

export const generateDocument = async (request, reply) => {
    try {
        const { templateId, studentId } = request.body;

        const [template, student] = await Promise.all([
            DocumentTemplate.findById(templateId),
            Student.findById(studentId).lean()
        ]);

        if (!template) return reply.code(404).send({ success: false, message: 'Template not found.' });
        if (!student) return reply.code(404).send({ success: false, message: 'Student not found.' });

        // Resolve all shortcodes from the template content
        const resolvedContent = resolveShortcodes(template.templateContent, student);

        // Generate a PDF document
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Split resolved content into lines and render on PDF pages
        const lines = resolvedContent.split('\n');
        const fontSize = 12;
        const titleFontSize = 18;
        const margin = 50;
        const lineHeight = fontSize * 1.5;
        const pageWidth = 595.28; // A4
        const pageHeight = 841.89;
        const maxY = pageHeight - margin;
        const maxWidth = pageWidth - 2 * margin;

        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = maxY;

        for (const line of lines) {
            if (y < margin + lineHeight) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                y = maxY;
            }

            const isTitle = line.startsWith('#');
            const cleanLine = line.replace(/^#+\s*/, '');
            const currentFont = isTitle ? boldFont : font;
            const currentSize = isTitle ? titleFontSize : fontSize;

            // Word-wrap logic
            const words = cleanLine.split(' ');
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const textWidth = currentFont.widthOfTextAtSize(testLine, currentSize);
                if (textWidth > maxWidth && currentLine) {
                    page.drawText(currentLine, { x: margin, y, size: currentSize, font: currentFont, color: rgb(0, 0, 0) });
                    y -= lineHeight;
                    currentLine = word;
                    if (y < margin + lineHeight) {
                        page = pdfDoc.addPage([pageWidth, pageHeight]);
                        y = maxY;
                    }
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) {
                page.drawText(currentLine, { x: margin, y, size: currentSize, font: currentFont, color: rgb(0, 0, 0) });
                y -= lineHeight;
            }

            // Extra spacing after titles
            if (isTitle) y -= lineHeight * 0.5;
        }

        const pdfBytes = await pdfDoc.save();

        // Save generated file
        const token = crypto.randomUUID();
        const fileName = `${template.docType}_${student.fullNameEn.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const filePath = path.join(GENERATED_DIR, fileName);
        fs.writeFileSync(filePath, pdfBytes);

        // Store download record (expires in 24 hours)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await GeneratedDocument.create({
            template: template._id,
            student: student._id,
            filePath,
            fileName,
            downloadToken: token,
            expiresAt,
            generatedBy: request.user?.id || null
        });

        const baseUrl = `${request.protocol}://${request.hostname}`;
        const downloadUrl = `${baseUrl}/api/v1/documents/download/${token}`;

        return reply.send({
            success: true,
            message: 'Document generated successfully.',
            downloadUrl,
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to generate document.' });
    }
};

// --- TEMPORARY DOWNLOAD ---

export const downloadDocument = async (request, reply) => {
    try {
        const { token } = request.params;
        const doc = await GeneratedDocument.findOne({ downloadToken: token });

        if (!doc) {
            return reply.code(404).send({ success: false, message: 'Download link not found or expired.' });
        }

        if (new Date() > doc.expiresAt) {
            // Clean up expired file
            if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);
            await GeneratedDocument.findByIdAndDelete(doc._id);
            return reply.code(410).send({ success: false, message: 'Download link has expired.' });
        }

        if (!fs.existsSync(doc.filePath)) {
            return reply.code(404).send({ success: false, message: 'Generated file not found on server.' });
        }

        reply.header('Content-Type', 'application/pdf');
        reply.header('Content-Disposition', `attachment; filename="${doc.fileName}"`);

        const stream = fs.createReadStream(doc.filePath);
        return reply.send(stream);
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to download document.' });
    }
};

// --- SHORTCODES LIST ---

export const getAvailableShortcodes = async (request, reply) => {
    return reply.send({
        success: true,
        data: Object.entries(SHORTCODE_MAP).map(([code, field]) => ({ shortcode: code, mapsTo: field }))
    });
};

// --- EXPORT / IMPORT ---

export const exportTemplates = async (request, reply) => {
    try {
        const templates = await DocumentTemplate.find().lean();
        const csvData = templates.map(t => ({
            Name: t.name,
            DocType: t.docType,
            FileType: t.fileType || '',
            Active: t.isActive ? 'Yes' : 'No',
            Description: t.description || '',
            Shortcodes: (t.shortcodes || []).join('; ')
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="templates_export_${new Date().toISOString().split('T')[0]}.csv"`);
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export templates.' });
    }
};

export const importTemplates = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        const operations = [];
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            const name = row['Name'];
            if (name) {
                operations.push({
                    updateOne: {
                        filter: { name },
                        update: {
                            docType: row['DocType'] || 'general',
                            fileType: row['FileType'] || '',
                            isActive: row['Active'] === 'Yes',
                            description: row['Description'] || '',
                            shortcodes: row['Shortcodes'] ? row['Shortcodes'].split(';').map(s => s.trim()) : []
                        },
                        upsert: true
                    }
                });
            }
        }

        if (operations.length > 0) {
            await DocumentTemplate.bulkWrite(operations);
        }

        return reply.send({ success: true, message: `Imported/Updated ${operations.length} templates.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import templates.' });
    }
};
