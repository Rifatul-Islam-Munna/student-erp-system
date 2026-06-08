import BatchEnrolled from '../models/BatchEnrolled.js';
import logger from '../services/logger.service.js';

export const getAllBatchEnrolled = async (request, reply) => {
    try {
        const { page = 1, limit = 10, batch, student, status } = request.query;
        
        const query = {};
        
        if (batch) query.batch = batch;
        if (student) query.student = student;
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [enrollments, total] = await Promise.all([
            BatchEnrolled.find(query)
                .populate('batch', 'classTime classDays branch teacher')
                .populate('student', 'fullNameEn email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            BatchEnrolled.countDocuments(query)
        ]);
        
        return reply.code(200).send({
            success: true,
            data: enrollments,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to retrieve enrollments.' });
    }
};

export const getBatchEnrolledById = async (request, reply) => {
    try {
        const enrollment = await BatchEnrolled.findById(request.params.id)
            .populate('batch')
            .populate('student');

        if (!enrollment) return reply.code(404).send({ success: false, message: 'Enrollment not found.' });

        return reply.code(200).send({ success: true, data: enrollment });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to find enrollment.' });
    }
};

export const createBatchEnrolled = async (request, reply) => {
    try {
        const enrollment = await BatchEnrolled.create(request.body);
        return reply.code(201).send({
            success: true,
            message: 'Enrollment created successfully.',
            data: enrollment
        });
    } catch (error) {
        logger.error(error);
        if (error.code === 11000) {
            return reply.code(400).send({ success: false, message: 'Student is already enrolled in this batch.' });
        }
        if (error.name === 'ValidationError') {
            return reply.code(400).send({ success: false, message: error.message });
        }
        return reply.code(500).send({ success: false, message: 'Failed to create enrollment.' });
    }
};

export const updateBatchEnrolled = async (request, reply) => {
    try {
        const enrollment = await BatchEnrolled.findByIdAndUpdate(
            request.params.id, 
            request.body, 
            { new: true, runValidators: true }
        );
        if (!enrollment) return reply.code(404).send({ success: false, message: 'Enrollment not found.' });
        
        return reply.send({ success: true, message: 'Enrollment updated successfully.', data: enrollment });
    } catch (error) {
        logger.error(error);
        if (error.code === 11000) {
            return reply.code(400).send({ success: false, message: 'Student is already enrolled in this batch.' });
        }
        return reply.code(500).send({ success: false, message: 'Failed to update enrollment.' });
    }
};

export const deleteBatchEnrolled = async (request, reply) => {
    try {
        const enrollment = await BatchEnrolled.findByIdAndDelete(request.params.id);
        if (!enrollment) return reply.code(404).send({ success: false, message: 'Enrollment not found.' });
        
        return reply.send({ success: true, message: 'Enrollment deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete enrollment.' });
    }
};
