import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Attendance from '../models/Attendance.js';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';
import logger from '../services/logger.service.js';

export const getAllAttendance = async (request, reply) => {
    try {
        const { page = 1, limit = 10, batch, student, startDate, endDate, status } = request.query;
        
        const query = {};
        if (batch) query.batch = batch;
        if (student) query.student = student;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [records, total] = await Promise.all([
            Attendance.find(query)
                .populate('batch', 'batchName')
                .populate('student', 'fullNameEn email phone')
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Attendance.countDocuments(query)
        ]);
        
        return reply.code(200).send({
            success: true,
            data: records,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch attendance records.' });
    }
};

export const bulkUpdateAttendance = async (request, reply) => {
    try {
        const { batch, date, records } = request.body;
        
        // Normalize date to start of day
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const operations = records.map(record => ({
            updateOne: {
                filter: { batch, student: record.student, date: attendanceDate },
                update: { status: record.status, remarks: record.remarks || '' },
                upsert: true
            }
        }));

        const result = await Attendance.bulkWrite(operations);

        return reply.send({
            success: true,
            message: 'Attendance processed successfully.',
            processedCount: records.length,
            result
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to process bulk attendance.' });
    }
};

export const exportAttendance = async (request, reply) => {
    try {
        const { batch, startDate, endDate } = request.query;
        const query = {};
        if (batch) query.batch = batch;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const records = await Attendance.find(query)
            .populate('batch', 'batchName')
            .populate('student', 'fullNameEn email')
            .lean();

        const csvData = records.map(r => ({
            Batch: r.batch?.batchName || 'N/A',
            Student: r.student?.fullNameEn || 'N/A',
            Email: r.student?.email || 'N/A',
            Date: r.date.toISOString().split('T')[0],
            Status: r.status,
            Remarks: r.remarks || ''
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="attendance_export_${new Date().toISOString().split('T')[0]}.csv"`);

        const outputStream = stringify(csvData, { header: true });
        return reply.send(outputStream);
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export attendance.' });
    }
};

export const importAttendance = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        const results = [];
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            const studentEmail = row['Email'];
            const dateStr = row['Date'];
            const status = row['Status'] ? row['Status'].toLowerCase() : null;
            const batchName = row['Batch'];

            if (studentEmail && dateStr && status) {
                const [student, batch] = await Promise.all([
                    Student.findOne({ email: studentEmail.toLowerCase() }),
                    Batch.findOne({ batchName: batchName })
                ]);

                if (student && batch) {
                    const normalizedDate = new Date(dateStr);
                    normalizedDate.setHours(0, 0, 0, 0);

                    results.push({
                        updateOne: {
                            filter: { batch: batch._id, student: student._id, date: normalizedDate },
                            update: { status: status, remarks: row['Remarks'] || '' },
                            upsert: true
                        }
                    });
                }
            }
        }

        if (results.length > 0) {
            await Attendance.bulkWrite(results);
        }

        return reply.send({
            success: true,
            message: `Successfully imported ${results.length} records.`,
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import attendance.' });
    }
};
