import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import DocumentTemplate from '../models/DocumentTemplate.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import Student from '../models/Student.js';
import Setting from '../models/Setting.js';
import { getStudentVariableList } from '../utils/studentVariableMap.js';
import logger from '../services/logger.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads/templates');
const GENERATED_DIR = path.join(__dirname, '../../uploads/generated');

const PAGE_PRESETS = {
    A4: { widthMm: 210, heightMm: 297 },
    A3: { widthMm: 297, heightMm: 420 },
    Letter: { widthMm: 216, heightMm: 279 },
    Legal: { widthMm: 216, heightMm: 356 }
};

const SYSTEM_VARIABLES = [
    { templateVariable: '{{sys_agency_name}}', dbField: 'site.name', source: 'setting' },
    { templateVariable: '{{sys_agency_address}}', dbField: 'site.address', source: 'setting' },
    { templateVariable: '{{sys_agency_phone}}', dbField: 'site.phone', source: 'setting' },
    { templateVariable: '{{sys_agency_email}}', dbField: 'site.email', source: 'setting' },
    { templateVariable: '{{sys_today}}', dbField: 'runtime.today', source: 'runtime' },
    { templateVariable: '{{sys_today:year}}', dbField: 'runtime.today', source: 'runtime' },
    { templateVariable: '{{sys_today:month}}', dbField: 'runtime.today', source: 'runtime' },
    { templateVariable: '{{sys_today:day}}', dbField: 'runtime.today', source: 'runtime' }
];

const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatDateValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const getDatePart = (value, part) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    if (part === 'year') return String(date.getUTCFullYear());
    if (part === 'month') return String(date.getUTCMonth() + 1).padStart(2, '0');
    return String(date.getUTCDate()).padStart(2, '0');
};

const extractTemplateVariables = (content = '') =>
    Array.from(new Set((String(content).match(/\{\{[^}]+\}\}/g) || []).map((item) => item.trim())));

const normalizePageSettings = (pageSettings = {}) => {
    const preset = pageSettings.preset || 'A4';
    const orientation = pageSettings.orientation === 'landscape' ? 'landscape' : 'portrait';
    const presetSize = PAGE_PRESETS[preset] || PAGE_PRESETS.A4;
    const baseWidth = Number(pageSettings.widthMm) || presetSize.widthMm;
    const baseHeight = Number(pageSettings.heightMm) || presetSize.heightMm;
    const widthMm = orientation === 'landscape' ? Math.max(baseWidth, baseHeight) : Math.min(baseWidth, baseHeight);
    const heightMm = orientation === 'landscape' ? Math.min(baseWidth, baseHeight) : Math.max(baseWidth, baseHeight);

    return {
        preset,
        orientation,
        widthMm,
        heightMm,
        marginTopMm: Number(pageSettings.marginTopMm) || 16,
        marginRightMm: Number(pageSettings.marginRightMm) || 16,
        marginBottomMm: Number(pageSettings.marginBottomMm) || 16,
        marginLeftMm: Number(pageSettings.marginLeftMm) || 16
    };
};

const buildSystemVariableMap = (settingsDoc = {}) => {
    const today = new Date();

    return {
        '{{sys_agency_name}}': settingsDoc?.site?.name || '',
        '{{sys_agency_address}}': settingsDoc?.site?.address || '',
        '{{sys_agency_phone}}': settingsDoc?.site?.phone || '',
        '{{sys_agency_email}}': settingsDoc?.site?.email || '',
        '{{sys_today}}': formatDateValue(today),
        '{{sys_today:year}}': getDatePart(today, 'year'),
        '{{sys_today:month}}': getDatePart(today, 'month'),
        '{{sys_today:day}}': getDatePart(today, 'day')
    };
};

const buildStudentVariableMap = (studentDoc = {}) => {
    const docVariables = studentDoc?.docVariables || {};
    const normalized = {};

    Object.entries(docVariables).forEach(([key, value]) => {
        normalized[key] = value == null ? '' : String(value);
    });

    return normalized;
};

const renderTemplateContent = (content = '', variableMap = {}) => {
    const variables = Object.keys(variableMap).sort((a, b) => b.length - a.length);
    let rendered = String(content || '');

    variables.forEach((key) => {
        rendered = rendered.replace(new RegExp(escapeRegExp(key), 'g'), variableMap[key] || '');
    });

    return rendered;
};

const findMissingVariables = (template = {}, variableMap = {}) => {
    const templateVariables = Array.isArray(template?.shortcodes) && template.shortcodes.length > 0
        ? template.shortcodes
        : extractTemplateVariables(template?.templateContent || '');

    return templateVariables.filter((variable) => {
        const value = variableMap[variable];
        return value == null || String(value).trim() === '';
    });
};

const buildCustomFontCss = (template = {}) => {
    const customFonts = Array.isArray(template?.customFonts) ? template.customFonts : [];

    return customFonts
        .filter((font) => font?.family && font?.source)
        .map((font) => `
      @font-face {
        font-family: "${escapeHtml(font.family)}";
        src: url("${font.source}");
      }
    `)
        .join('\n');
};

const buildPrintHtml = ({ template, content, title }) => {
    const settings = normalizePageSettings(template?.pageSettings);
    const pageSizeCss = `${settings.widthMm}mm ${settings.heightMm}mm`;
    const pagePaddingCss = `${settings.marginTopMm}mm ${settings.marginRightMm}mm ${settings.marginBottomMm}mm ${settings.marginLeftMm}mm`;
    const customFontCss = buildCustomFontCss(template);

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title || template?.name || 'Document')}</title>
    <style>
      @page {
        size: ${pageSizeCss};
        margin: 0;
      }

      ${customFontCss}

      :root {
        color-scheme: light;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #d8dee8;
        font-family: Mulish, Arial, sans-serif;
        color: #172033;
      }

      .page-shell {
        min-height: 100vh;
        padding: 24px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }

      .page {
        width: ${settings.widthMm}mm;
        min-height: ${settings.heightMm}mm;
        background: #ffffff;
        padding: ${pagePaddingCss};
        box-shadow: 0 24px 70px rgba(16, 24, 40, 0.16);
      }

      .page * {
        max-width: 100%;
      }

      .ql-editor {
        position: relative;
        min-height: 100%;
        white-space: normal;
      }

      p {
        margin: 0 0 12px;
        line-height: 1.65;
      }

      h1, h2, h3, h4, h5, h6 {
        margin: 0 0 14px;
        line-height: 1.2;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0 18px;
      }

      th, td {
        border: 1px solid #334155;
        padding: 8px 10px;
        vertical-align: top;
      }

      ul, ol {
        padding-left: 24px;
      }

      blockquote {
        border-left: 4px solid #94a3b8;
        margin: 14px 0;
        padding: 8px 0 8px 16px;
        color: #475569;
      }

      img {
        display: inline-block;
        max-width: 100%;
        height: auto;
      }

      .ql-align-center {
        text-align: center;
      }

      .ql-align-right {
        text-align: right;
      }

      .ql-align-justify {
        text-align: justify;
      }

      .ql-direction-rtl {
        direction: rtl;
        text-align: inherit;
      }

      .ql-indent-1:not(.ql-direction-rtl) { padding-left: 3em; }
      .ql-indent-2:not(.ql-direction-rtl) { padding-left: 6em; }
      .ql-indent-3:not(.ql-direction-rtl) { padding-left: 9em; }
      .ql-indent-4:not(.ql-direction-rtl) { padding-left: 12em; }
      .ql-indent-5:not(.ql-direction-rtl) { padding-left: 15em; }
      .ql-indent-6:not(.ql-direction-rtl) { padding-left: 18em; }
      .ql-indent-7:not(.ql-direction-rtl) { padding-left: 21em; }
      .ql-indent-8:not(.ql-direction-rtl) { padding-left: 24em; }

      .ql-indent-1.ql-direction-rtl.ql-align-right { padding-right: 3em; }
      .ql-indent-2.ql-direction-rtl.ql-align-right { padding-right: 6em; }
      .ql-indent-3.ql-direction-rtl.ql-align-right { padding-right: 9em; }
      .ql-indent-4.ql-direction-rtl.ql-align-right { padding-right: 12em; }
      .ql-indent-5.ql-direction-rtl.ql-align-right { padding-right: 15em; }
      .ql-indent-6.ql-direction-rtl.ql-align-right { padding-right: 18em; }
      .ql-indent-7.ql-direction-rtl.ql-align-right { padding-right: 21em; }
      .ql-indent-8.ql-direction-rtl.ql-align-right { padding-right: 24em; }

      .ql-size-small {
        font-size: 0.75em;
      }

      .ql-size-large {
        font-size: 1.5em;
      }

      .ql-size-huge {
        font-size: 2.5em;
      }

      .ql-font-serif {
        font-family: Georgia, Times New Roman, serif;
      }

      .ql-font-monospace {
        font-family: Consolas, Monaco, monospace;
      }

      .ql-script-sub {
        vertical-align: sub;
        font-size: 0.75em;
      }

      .ql-script-super {
        vertical-align: super;
        font-size: 0.75em;
      }

      .ql-editor ol li[data-list="ordered"],
      .ql-editor ul li[data-list="bullet"],
      .ql-editor ul li[data-list="check"] {
        list-style-type: none;
        position: relative;
      }

      .ql-editor ul li[data-list="bullet"]::before {
        content: "\\2022";
        position: absolute;
        left: -1.25em;
      }

      .ql-editor ul li[data-list="check"]::before {
        content: "\\2610";
        position: absolute;
        left: -1.35em;
      }

      .ql-editor ul li[data-checked="true"]::before {
        content: "\\2611";
      }

      @media print {
        body {
          background: #ffffff;
        }

        .page-shell {
          padding: 0;
        }

        .page {
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <div class="page ql-editor">${content || '<p></p>'}</div>
    </div>
  </body>
</html>`;
};

const serializeTemplate = (template) => {
    const record = typeof template?.toObject === 'function' ? template.toObject() : template;
    if (!record) return record;

    return {
        ...record,
        pageSettings: normalizePageSettings(record.pageSettings),
        shortcodes: Array.isArray(record.shortcodes) ? record.shortcodes : extractTemplateVariables(record.templateContent || '')
    };
};

const ensureDirectories = () => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });
};

ensureDirectories();

export const getAllTemplates = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, docType, status, isActive } = request.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (docType) query.docType = docType;
        if (status) query.status = status;
        if (typeof isActive === 'boolean') query.isActive = isActive;

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [templates, total] = await Promise.all([
            DocumentTemplate.find(query).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
            DocumentTemplate.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: templates.map(serializeTemplate),
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit, 10)),
                page: parseInt(page, 10),
                limit: parseInt(limit, 10)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch templates.' });
    }
};

export const getTemplateById = async (request, reply) => {
    try {
        const template = await DocumentTemplate.findById(request.params.id).lean();
        if (!template) return reply.code(404).send({ success: false, message: 'Template not found.' });
        return reply.code(200).send({ success: true, data: serializeTemplate(template) });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to find template.' });
    }
};

export const createTemplate = async (request, reply) => {
    try {
        const payload = {
            ...request.body,
            pageSettings: normalizePageSettings(request.body?.pageSettings),
            shortcodes: extractTemplateVariables(request.body?.templateContent || '')
        };

        const template = await DocumentTemplate.create(payload);
        return reply.code(201).send({
            success: true,
            message: 'Template created successfully.',
            data: serializeTemplate(template)
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create template.' });
    }
};

export const updateTemplate = async (request, reply) => {
    try {
        const payload = { ...request.body };

        if (payload.pageSettings) {
            payload.pageSettings = normalizePageSettings(payload.pageSettings);
        }

        if (payload.templateContent !== undefined) {
            payload.shortcodes = extractTemplateVariables(payload.templateContent || '');
        }

        const template = await DocumentTemplate.findByIdAndUpdate(request.params.id, payload, { new: true, runValidators: true });
        if (!template) return reply.code(404).send({ success: false, message: 'Template not found.' });
        return reply.send({ success: true, message: 'Template updated successfully.', data: serializeTemplate(template) });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update template.' });
    }
};

export const deleteTemplate = async (request, reply) => {
    try {
        const template = await DocumentTemplate.findByIdAndDelete(request.params.id);
        if (!template) return reply.code(404).send({ success: false, message: 'Template not found.' });

        if (template.originalFilePath && fs.existsSync(template.originalFilePath)) {
            fs.unlinkSync(template.originalFilePath);
        }

        return reply.send({ success: true, message: 'Template deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete template.' });
    }
};

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

        const writeStream = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
            data.file.pipe(writeStream);
            data.file.on('end', resolve);
            data.file.on('error', reject);
        });

        if (template.originalFilePath && fs.existsSync(template.originalFilePath)) {
            fs.unlinkSync(template.originalFilePath);
        }

        template.originalFilePath = filePath;
        template.originalFileName = data.filename;
        template.fileType = ext.replace('.', '');
        await template.save();

        return reply.send({ success: true, message: 'File uploaded successfully.', data: serializeTemplate(template) });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to upload file.' });
    }
};

export const generateDocument = async (request, reply) => {
    let browser = null;
    try {
        const { templateId, studentId } = request.body;

        const [template, student, settingsDoc] = await Promise.all([
            DocumentTemplate.findById(templateId).lean(),
            studentId ? Student.findById(studentId).lean() : Promise.resolve(null),
            Setting.findOne().lean()
        ]);

        if (!template) return reply.code(404).send({ success: false, message: 'Template not found.' });
        if (template.docType === 'student' && !student) {
            return reply.code(400).send({ success: false, message: 'Student document needs valid student.' });
        }

        const variableMap = {
            ...buildSystemVariableMap(settingsDoc),
            ...(student ? buildStudentVariableMap(student) : {})
        };

        const missingVariables = findMissingVariables(template, variableMap);
        if (missingVariables.length > 0) {
            return reply.code(400).send({
                success: false,
                message: missingVariables.length === 1
                    ? '1 variable is missing. Please fix it first.'
                    : `${missingVariables.length} variables are missing. Please fix them first.`,
                missingVariables,
                missingCount: missingVariables.length
            });
        }

        const renderedContent = renderTemplateContent(template.templateContent, variableMap);
        const renderedHtml = buildPrintHtml({
            template,
            content: renderedContent,
            title: student ? `${template.name} - ${student.fullNameEn}` : template.name
        });

        // Generate PDF using Puppeteer
        const settings = normalizePageSettings(template?.pageSettings);
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        await page.setContent(renderedHtml, { waitUntil: 'networkidle0', timeout: 30000 });

        const pdfBuffer = await page.pdf({
            width: `${settings.widthMm}mm`,
            height: `${settings.heightMm}mm`,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            printBackground: true,
            preferCSSPageSize: false
        });

        await browser.close();
        browser = null;

        const token = crypto.randomUUID();
        const fileName = `${template.name.replace(/[^a-z0-9_-]+/gi, '_')}_${Date.now()}.pdf`;
        const filePath = path.join(GENERATED_DIR, fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await GeneratedDocument.create({
            template: template._id,
            student: student?._id || null,
            filePath,
            fileName,
            contentType: 'application/pdf',
            fileExtension: 'pdf',
            downloadToken: token,
            expiresAt,
            generatedBy: request.user?.id || null
        });

        return reply.send({
            success: true,
            message: 'Document generated successfully.',
            downloadToken: token,
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        if (browser) {
            try { await browser.close(); } catch (_) { /* ignore */ }
        }
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to generate document.' });
    }
};

export const downloadDocument = async (request, reply) => {
    try {
        const { token } = request.params;
        const doc = await GeneratedDocument.findOne({ downloadToken: token });

        if (!doc) {
            return reply.code(404).send({ success: false, message: 'Download link not found or expired.' });
        }

        if (new Date() > doc.expiresAt) {
            if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);
            await GeneratedDocument.findByIdAndDelete(doc._id);
            return reply.code(410).send({ success: false, message: 'Download link has expired.' });
        }

        if (!fs.existsSync(doc.filePath)) {
            return reply.code(404).send({ success: false, message: 'Generated file not found on server.' });
        }

        reply.header('Content-Type', doc.contentType || 'application/octet-stream');
        reply.header('Content-Disposition', `attachment; filename="${doc.fileName}"`);

        const stream = fs.createReadStream(doc.filePath);
        return reply.send(stream);
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to download document.' });
    }
};

export const getAvailableShortcodes = async (_request, reply) => {
    return reply.send({
        success: true,
        data: {
            student: getStudentVariableList().map((item) => ({
                templateVariable: item.templateVariable,
                variableName: item.variableName,
                dbField: item.dbField,
                source: item.source
            })),
            system: SYSTEM_VARIABLES
        }
    });
};

export const exportTemplates = async (_request, reply) => {
    try {
        const templates = await DocumentTemplate.find().lean();
        const csvData = templates.map((template) => ({
            Name: template.name,
            DocumentType: template.docType,
            Status: template.status || 'draft',
            Active: template.isActive ? 'Yes' : 'No',
            PagePreset: template.pageSettings?.preset || 'A4',
            Orientation: template.pageSettings?.orientation || 'portrait',
            Description: template.description || '',
            Variables: (template.shortcodes || []).join('; ')
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
            const name = row.Name;
            if (!name) continue;

            operations.push({
                updateOne: {
                    filter: { name },
                    update: {
                        docType: row.DocumentType || 'other',
                        status: row.Status || 'draft',
                        isActive: row.Active === 'Yes',
                        description: row.Description || '',
                        shortcodes: row.Variables ? row.Variables.split(';').map((item) => item.trim()).filter(Boolean) : [],
                        pageSettings: normalizePageSettings({
                            preset: row.PagePreset || 'A4',
                            orientation: row.Orientation || 'portrait'
                        })
                    },
                    upsert: true
                }
            });
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
