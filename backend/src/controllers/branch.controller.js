import Branch from '../models/Branch.js';
import logger from '../services/logger.service.js';

export const getBranches = async (request, reply) => {
    try {
        const branches = await Branch.find({}).sort({ name: 1 });
        return reply.send({
            success: true,
            data: branches
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch branches' });
    }
};

export const getBranchById = async (request, reply) => {
    try {
        const branch = await Branch.findById(request.params.id);
        if (!branch) return reply.code(404).send({ success: false, message: 'Branch not found' });
        return reply.send({ success: true, data: branch });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch branch details' });
    }
};

export const createBranch = async (request, reply) => {
    try {
        const { name } = request.body;
        const existing = await Branch.findOne({ name });
        if (existing) return reply.code(400).send({ success: false, message: 'Branch name already exists' });

        const branch = await Branch.create(request.body);
        return reply.code(201).send({
            success: true,
            message: 'Branch created successfully',
            data: branch
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create branch' });
    }
};

export const updateBranch = async (request, reply) => {
    try {
        const { name } = request.body;
        if (name) {
            const existing = await Branch.findOne({ name, _id: { $ne: request.params.id } });
            if (existing) return reply.code(400).send({ success: false, message: 'Branch name already exists' });
        }

        const branch = await Branch.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
        if (!branch) return reply.code(404).send({ success: false, message: 'Branch not found' });

        return reply.send({
            success: true,
            message: 'Branch updated successfully',
            data: branch
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update branch' });
    }
};

export const deleteBranch = async (request, reply) => {
    try {
        const branch = await Branch.findByIdAndDelete(request.params.id);
        if (!branch) return reply.code(404).send({ success: false, message: 'Branch not found' });
        return reply.send({ success: true, message: 'Branch deleted successfully' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete branch' });
    }
};
