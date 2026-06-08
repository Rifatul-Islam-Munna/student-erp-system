import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Batch from '../models/Batch.js';
import logger from '../services/logger.service.js';

export const getBatchStats = async (request, reply) => {
    try {
        const total = await Batch.countDocuments();
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await Batch.countDocuments({ createdAt: { $gte: startOfMonth } });

        const branchDistribution = await Batch.aggregate([
            { $group: { _id: "$branch", count: { $sum: 1 } } }
        ]);

        return reply.send({
            success: true,
            data: {
                total,
                newThisMonth,
                branchDistribution
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch batch metrics' });
    }
};

export const getAllBatches = async (request, reply) => {
    try {
        const { page = 1, limit = 10, startDate, endDate, branch, school, country, search } = request.query;
        
        const query = {};

        // Branch localization
        if (request.user.role === 'branch' && request.user.branch) {
            query.branch = request.user.branch;
        } else if (branch) {
            query.branch = branch;
        }

        if (school) query.school = school;

        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        }

        if (branch) query.branch = branch;
        if (country) query.country = country;

        if (search) {
            query.batchName = { $regex: search, $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [batches, total] = await Promise.all([
            Batch.find(query)
                .populate('teacher', 'fullName')
                .populate('branch', 'name')
                .populate('school', 'nameEn')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Batch.countDocuments(query)
        ]);
        
        return reply.code(200).send({
            success: true,
            data: batches,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch batches' });
    }
};

export const getBatchById = async (request, reply) => {
    try {
        const batch = await Batch.findById(request.params.id)
            .populate('teacher', 'fullName')
            .populate('branch', 'name')
            .populate('school', 'nameEn');
        if (!batch) return reply.code(404).send({ success: false, message: 'Batch not found' });

        return reply.code(200).send({ success: true, data: batch });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Server error' });
    }
};

export const createBatch = async (request, reply) => {
    try {
        const batch = await Batch.create(request.body);
        return reply.code(201).send({
            success: true,
            message: 'Batch created successfully',
            data: batch
        });
    } catch (error) {
        logger.error(error);
        if (error.name === 'ValidationError') {
            return reply.code(400).send({ success: false, message: error.message });
        }
        return reply.code(500).send({ success: false, message: 'Failed to create batch' });
    }
};

export const updateBatch = async (request, reply) => {
    try {
        const batch = await Batch.findByIdAndUpdate(
            request.params.id, 
            request.body, 
            { new: true, runValidators: true }
        );
        if (!batch) return reply.code(404).send({ success: false, message: 'Batch not found' });
        
        return reply.send({ success: true, message: 'Batch updated', data: batch });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Server error' });
    }
};

export const deleteBatch = async (request, reply) => {
    try {
        const batch = await Batch.findByIdAndDelete(request.params.id);
        if (!batch) return reply.code(404).send({ success: false, message: 'Batch not found' });
        
        return reply.send({ success: true, message: 'Successfully deleted' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Deletion failed' });
    }
};

export const exportBatches = async (request, reply) => {
    try {
        const { startDate, endDate, branch, country } = request.query;
        const query = {};
        
        if (startDate && endDate) query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        if (branch) query.branch = branch;
        if (country) query.country = country;

        const batches = await Batch.find(query)
            .populate('teacher', 'fullName')
            .populate('branch', 'name')
            .populate('school', 'nameEn')
            .lean();
        
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="batches_export.csv"');

        const outputStream = stringify(batches, {
            header: true,
            columns: [
                { key: 'batchName', header: 'Batch Name' },
                { key: 'country', header: 'Country' },
                { key: 'level', header: 'Level' },
                { key: 'startDate', header: 'Start Date' },
                { key: 'endDate', header: 'End Date' },
                { key: 'maxStudents', header: 'Max Students' },
                { key: 'teacher.fullName', header: 'Teacher' },
                { key: 'branch.name', header: 'Branch' },
                { key: 'school.nameEn', header: 'School' },
                { key: 'classTime', header: 'Class Time' },
                { key: 'classDuration', header: 'Duration (Hrs)' },
                { key: 'createdAt', header: 'Date Added' }
            ],
            cast: {
                date: (value) => value ? value.toISOString() : ''
            }
        });

        return reply.send(outputStream);
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Export failed' });
    }
};

export const importBatches = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'CSV File missing' });

        const results = [];
        const stream = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of stream) {
            if (row['Batch Name']) {
                results.push({
                    batchName: row['Batch Name'],
                    country: row['Country'] || null,
                    level: row['Level'] || null,
                    startDate: row['Start Date'] ? new Date(row['Start Date']) : null,
                    endDate: row['End Date'] ? new Date(row['End Date']) : null,
                    maxStudents: row['Max Students'] ? parseInt(row['Max Students']) : null,
                    teacher: row['Teacher'] || null,
                    branch: row['Branch'] || null,
                    classTime: row['Class Time'] || null,
                    classDuration: row['Duration (Hrs)'] ? parseFloat(row['Duration (Hrs)']) : null
                });
            }
        }

        if (results.length > 0) {
            await Batch.insertMany(results);
        }

        return reply.send({ success: true, message: `Imported ${results.length} rows successfully` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Import parsing failed' });
    }
};
