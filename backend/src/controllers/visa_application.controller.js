import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import VisaApplication from '../models/VisaApplication.js';
import logger from '../services/logger.service.js';

/**
 * GET /visa-applications
 */
export const getAllVisaApplications = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, status, country, student, branch, agent, startDate, endDate } = request.query;
        const query = {};

        if (request.user.role === 'branch' && request.user.branch) query.branch = request.user.branch;
        else if (branch) query.branch = branch;

        if (search) {
            query.$or = [
                { visaType: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } },
                { passportNumber: { $regex: search, $options: 'i' } },
                { visaNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) query.status = status;
        if (country) query.country = country;
        if (student) query.student = student;
        if (agent) query.agent = agent;
        if (startDate || endDate) {
            query.applicationDate = {};
            if (startDate) query.applicationDate.$gte = new Date(startDate);
            if (endDate) query.applicationDate.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [applications, total] = await Promise.all([
            VisaApplication.find(query)
                .populate('student', 'fullNameEn phone email passportNo')
                .populate('school', 'nameEn city country')
                .populate('schoolSubmission', 'status intake')
                .populate('agent', 'fullName')
                .populate('branch', 'name')
                .populate('recordedBy', 'fullName')
                .sort({ applicationDate: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            VisaApplication.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: applications,
            pagination: { total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch visa applications.' });
    }
};

/**
 * GET /visa-applications/:id
 */
export const getVisaApplicationById = async (request, reply) => {
    try {
        const app = await VisaApplication.findById(request.params.id)
            .populate('student', 'fullNameEn phone email passportNo dob nationality')
            .populate('school', 'nameEn city country')
            .populate('schoolSubmission')
            .populate('agent', 'fullName email')
            .populate('branch', 'name')
            .populate('recordedBy', 'fullName')
            .populate('visaFeeTransaction')
            .populate('statusHistory.updatedBy', 'fullName');
        if (!app) return reply.code(404).send({ success: false, message: 'Visa application not found.' });
        return reply.send({ success: true, data: app });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch visa application.' });
    }
};

/**
 * POST /visa-applications
 */
export const createVisaApplication = async (request, reply) => {
    try {
        const appData = {
            ...request.body,
            recordedBy: request.user._id,
            statusHistory: [{ status: request.body.status || 'Document Collection', date: new Date(), notes: 'Application created', updatedBy: request.user._id }]
        };

        const app = await VisaApplication.create(appData);
        const populated = await app.populate([
            { path: 'student', select: 'fullNameEn phone email' },
            { path: 'school', select: 'nameEn' },
            { path: 'branch', select: 'name' },
            { path: 'recordedBy', select: 'fullName' }
        ]);

        return reply.code(201).send({ success: true, message: 'Visa application created successfully.', data: populated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create visa application.' });
    }
};

/**
 * PUT /visa-applications/:id
 */
export const updateVisaApplication = async (request, reply) => {
    try {
        const app = await VisaApplication.findById(request.params.id);
        if (!app) return reply.code(404).send({ success: false, message: 'Visa application not found.' });

        // If status is changing, add to history
        if (request.body.status && request.body.status !== app.status) {
            app.statusHistory.push({
                status: request.body.status,
                date: new Date(),
                notes: request.body.statusNote || '',
                updatedBy: request.user._id
            });
        }

        Object.assign(app, request.body);
        await app.save();

        const updated = await VisaApplication.findById(request.params.id)
            .populate('student', 'fullNameEn phone email')
            .populate('school', 'nameEn')
            .populate('branch', 'name')
            .populate('recordedBy', 'fullName');

        return reply.send({ success: true, message: 'Visa application updated successfully.', data: updated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update visa application.' });
    }
};

/**
 * DELETE /visa-applications/:id
 */
export const deleteVisaApplication = async (request, reply) => {
    try {
        const app = await VisaApplication.findById(request.params.id);
        if (!app) return reply.code(404).send({ success: false, message: 'Visa application not found.' });
        await VisaApplication.findByIdAndDelete(request.params.id);
        return reply.send({ success: true, message: 'Visa application deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete visa application.' });
    }
};

/**
 * PATCH /visa-applications/:id/checklist
 * Update checklist item completion.
 */
export const updateChecklist = async (request, reply) => {
    try {
        const app = await VisaApplication.findById(request.params.id);
        if (!app) return reply.code(404).send({ success: false, message: 'Visa application not found.' });

        const { checklistItemId, isCompleted } = request.body;
        const item = app.checklist.id(checklistItemId);
        if (!item) return reply.code(404).send({ success: false, message: 'Checklist item not found.' });

        item.isCompleted = isCompleted;
        item.completedDate = isCompleted ? new Date() : null;
        await app.save();

        return reply.send({ success: true, message: 'Checklist updated.', data: app });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update checklist.' });
    }
};

/**
 * GET /visa-applications/pipeline
 * Get visa applications grouped by status for pipeline/kanban view.
 */
export const getVisaPipeline = async (request, reply) => {
    try {
        const { branch, country } = request.query;
        const match = {};
        if (branch) match.branch = branch;
        if (country) match.country = country;

        const pipeline = await VisaApplication.aggregate([
            { $match: match },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        return reply.send({ success: true, data: pipeline });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch visa pipeline.' });
    }
};

/**
 * GET /visa-applications/export
 */
export const exportVisaApplications = async (request, reply) => {
    try {
        const apps = await VisaApplication.find()
            .populate('student', 'fullNameEn')
            .populate('school', 'nameEn')
            .populate('branch', 'name')
            .lean();

        const csvData = apps.map(a => ({
            Student: a.student?.fullNameEn || 'N/A',
            School: a.school?.nameEn || 'N/A',
            Country: a.country,
            'Visa Type': a.visaType,
            Status: a.status,
            'Passport No': a.passportNumber || '',
            'Application Date': new Date(a.applicationDate).toLocaleDateString(),
            'Decision Date': a.decisionDate ? new Date(a.decisionDate).toLocaleDateString() : '',
            'Travel Date': a.travelDate ? new Date(a.travelDate).toLocaleDateString() : '',
            'Visa Fee': a.visaFee,
            Branch: a.branch?.name || 'N/A'
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="visa_applications.csv"');
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export visa applications.' });
    }
};

/**
 * POST /visa-applications/import
 */
export const importVisaApplications = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Country'] && row['Visa Type']) {
                await VisaApplication.create({
                    student: row['Student ID'] || null,
                    visaType: row['Visa Type'],
                    country: row['Country'],
                    status: row['Status'] || 'Document Collection',
                    passportNumber: row['Passport No'] || '',
                    visaFee: parseFloat(row['Visa Fee']) || 0,
                    applicationDate: row['Application Date'] ? new Date(row['Application Date']) : new Date(),
                    branch: request.user.branch || null,
                    recordedBy: request.user._id,
                    statusHistory: [{ status: row['Status'] || 'Document Collection', date: new Date(), notes: 'Imported', updatedBy: request.user._id }]
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported ${created} visa applications.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import visa applications.' });
    }
};
