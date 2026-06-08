import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import SchoolSubmission from '../models/SchoolSubmission.js';
import Student from '../models/Student.js';
import School from '../models/School.js';
import logger from '../services/logger.service.js';

export const getAllSubmissions = async (request, reply) => {
    try {
        const { page = 1, limit = 10, student, school, status, intake, startDate, endDate } = request.query;
        
        const query = {};
        if (student) query.student = student;
        if (school) query.school = school;
        if (status) query.status = status;
        if (intake) query.intake = intake;
        if (startDate || endDate) {
            query.appliedDate = {};
            if (startDate) query.appliedDate.$gte = new Date(startDate);
            if (endDate) query.appliedDate.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [submissions, total] = await Promise.all([
            SchoolSubmission.find(query)
                .populate('student', 'fullNameEn email phone')
                .populate('school', 'nameEn city country')
                .sort({ appliedDate: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            SchoolSubmission.countDocuments(query)
        ]);
        
        return reply.code(200).send({
            success: true,
            data: submissions,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch submissions.' });
    }
};

export const getSubmissionById = async (request, reply) => {
    try {
        const submission = await SchoolSubmission.findById(request.params.id)
            .populate('student')
            .populate('school');
        if (!submission) return reply.code(404).send({ success: false, message: 'Submission not found.' });
        return reply.code(200).send({ success: true, data: submission });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to find submission.' });
    }
};

export const createSubmission = async (request, reply) => {
    try {
        const submission = await SchoolSubmission.create(request.body);
        return reply.code(201).send({ success: true, message: 'Submission created successfully.', data: submission });
    } catch (error) {
        logger.error(error);
        if (error.code === 11000) {
            return reply.code(400).send({ success: false, message: 'Student already has an application for this school and intake.' });
        }
        return reply.code(500).send({ success: false, message: 'Failed to create submission.' });
    }
};

export const updateSubmission = async (request, reply) => {
    try {
        const submission = await SchoolSubmission.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
        if (!submission) return reply.code(404).send({ success: false, message: 'Submission not found.' });
        return reply.send({ success: true, message: 'Submission updated successfully.', data: submission });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update submission.' });
    }
};

export const deleteSubmission = async (request, reply) => {
    try {
        const submission = await SchoolSubmission.findByIdAndDelete(request.params.id);
        if (!submission) return reply.code(404).send({ success: false, message: 'Submission not found.' });
        return reply.send({ success: true, message: 'Submission deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete submission.' });
    }
};

export const exportSubmissions = async (request, reply) => {
    try {
        const submissions = await SchoolSubmission.find()
            .populate('student', 'fullNameEn email')
            .populate('school', 'nameEn')
            .lean();
        
        const csvData = submissions.map(s => ({
            Student: s.student?.fullNameEn || 'N/A',
            Email: s.student?.email || 'N/A',
            School: s.school?.nameEn || 'N/A',
            Intake: s.intake,
            Status: s.status,
            'Applied Date': s.appliedDate.toISOString().split('T')[0],
            Notes: s.notes || ''
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="submissions_export_${new Date().toISOString().split('T')[0]}.csv"`);

        const outputStream = stringify(csvData, { header: true });
        return reply.send(outputStream);
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export submissions.' });
    }
};

export const importSubmissions = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        const operations = [];
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            const email = row['Email'];
            const schoolName = row['School'];
            const intake = row['Intake'];

            if (email && schoolName && intake) {
                const [student, school] = await Promise.all([
                    Student.findOne({ email: email.toLowerCase() }),
                    School.findOne({ nameEn: schoolName })
                ]);

                if (student && school) {
                    operations.push({
                        updateOne: {
                            filter: { student: student._id, school: school._id, intake: intake },
                            update: {
                                status: row['Status'] || 'Pending',
                                notes: row['Notes'] || '',
                                appliedDate: row['Applied Date'] ? new Date(row['Applied Date']) : new Date()
                            },
                            upsert: true
                        }
                    });
                }
            }
        }

        if (operations.length > 0) {
            await SchoolSubmission.bulkWrite(operations);
        }

        return reply.send({ success: true, message: `Imported/Updated ${operations.length} submissions.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import submissions.' });
    }
};

// === Pipeline / Kanban Features (Feature #4) ===

/**
 * GET /school-submissions/pipeline
 * Group submissions by status for Kanban board.
 */
export const getSubmissionPipeline = async (request, reply) => {
    try {
        const { school, intake, agent, branch } = request.query;
        const match = {};
        if (school) match.school = school;
        if (intake) match.intake = intake;
        if (agent) match.agent = agent;
        if (branch) match.branch = branch;

        const pipeline = await SchoolSubmission.aggregate([
            { $match: match },
            { $group: {
                _id: '$status',
                count: { $sum: 1 },
                submissions: { $push: { _id: '$_id', student: '$student', school: '$school', intake: '$intake', deadline: '$deadline', priority: '$priority', appliedDate: '$appliedDate' } }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Order by pipeline stage
        const stageOrder = ['Pending', 'Submitted', 'Interview Scheduled', 'COE Approved', 'Visa Approved', 'Rejected'];
        const ordered = stageOrder.map(stage => {
            const found = pipeline.find(p => p._id === stage);
            return { status: stage, count: found?.count || 0, submissions: found?.submissions || [] };
        });

        return reply.send({ success: true, data: ordered });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch pipeline.' });
    }
};

/**
 * PATCH /school-submissions/batch-update
 * Bulk status update for multiple submissions.
 */
export const batchUpdateSubmissions = async (request, reply) => {
    try {
        const { ids, status, notes } = request.body;
        if (!ids || !ids.length || !status) {
            return reply.code(400).send({ success: false, message: 'ids and status are required.' });
        }

        const updateData = { status };
        const result = await SchoolSubmission.updateMany(
            { _id: { $in: ids } },
            {
                $set: updateData,
                $push: {
                    statusHistory: {
                        status,
                        date: new Date(),
                        notes: notes || 'Bulk update',
                        updatedBy: request.user._id
                    }
                }
            }
        );

        return reply.send({ success: true, message: `Updated ${result.modifiedCount} submissions.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to batch update submissions.' });
    }
};
