import Permission from '../models/Permission.js';
import logger from '../services/logger.service.js';
import { ALL_PERMISSION_KEYS } from '../utils/permissionKeys.js';

// GET /permissions
export const getPermissions = async (request, reply) => {
    try {
        // Find and group structurally, or just send a flat array
        const permissions = await Permission.find({}).sort({ module: 1, name: 1 });
        
        return reply.code(200).send({
            success: true,
            data: permissions
        });
    } catch (error) {
        logger.error(error, 'Get permissions error');
        return reply.code(500).send({
            success: false,
            message: 'Failed to fetch permissions'
        });
    }
};

// GET /permissions/keys
export const getAllPermissionKeys = async (request, reply) => {
    try {
        return reply.code(200).send({
            success: true,
            data: ALL_PERMISSION_KEYS
        });
    } catch (error) {
        logger.error(error, 'Get generic keys error');
        return reply.code(500).send({
            success: false,
            message: 'Failed to fetch system permission keys'
        });
    }
};

// GET /permissions/:id
export const getPermissionById = async (request, reply) => {
    try {
        const { id } = request.params;
        const permission = await Permission.findById(id);
        
        if (!permission) {
            return reply.code(404).send({ success: false, message: 'Permission not found' });
        }

        return reply.code(200).send({
            success: true,
            data: permission
        });
    } catch (error) {
        logger.error(error, 'Get permission by ID error');
        return reply.code(500).send({ success: false, message: 'Failed to fetch permission' });
    }
};


// POST /permissions
export const createPermission = async (request, reply) => {
    try {
        const { name, description, module } = request.body;

        const existing = await Permission.findOne({ name });
        if (existing) {
            return reply.code(409).send({ success: false, message: 'Permission name already exists' });
        }

        const permission = await Permission.create({
            name,
            description,
            module
        });

        return reply.code(201).send({
            success: true,
            message: 'Permission created successfully',
            data: permission
        });
    } catch (error) {
        logger.error(error, 'Create permission error');
        return reply.code(500).send({ success: false, message: 'Failed to create permission' });
    }
};

// PUT /permissions/:id
export const updatePermission = async (request, reply) => {
    try {
        const { id } = request.params;
        const { name, description, module } = request.body;

        if (name) {
            const existing = await Permission.findOne({ name, _id: { $ne: id } });
            if (existing) {
                return reply.code(409).send({ success: false, message: 'Permission name already used by another entity' });
            }
        }

        const permission = await Permission.findByIdAndUpdate(
            id,
            { name, description, module },
            { new: true, runValidators: true }
        );

        if (!permission) {
            return reply.code(404).send({ success: false, message: 'Permission not found' });
        }

        return reply.code(200).send({
            success: true,
            message: 'Permission updated successfully',
            data: permission
        });
    } catch (error) {
        logger.error(error, 'Update permission error');
        return reply.code(500).send({ success: false, message: 'Failed to update permission' });
    }
};

// DELETE /permissions/:id
export const deletePermission = async (request, reply) => {
    try {
        const { id } = request.params;
        
        const permission = await Permission.findByIdAndDelete(id);
        if (!permission) {
            return reply.code(404).send({ success: false, message: 'Permission not found' });
        }

        return reply.code(200).send({
            success: true,
            message: 'Permission removed completely'
        });
    } catch (error) {
        logger.error(error, 'Delete permission error');
        return reply.code(500).send({ success: false, message: 'Failed to delete permission' });
    }
};
