import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Task from '../models/Task.js';
import User from '../models/User.js';
import logger from '../services/logger.service.js';

export const getAllTasks = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, status, priority, assignedTo, createdBy } = request.query;
        const query = {};

        // Permissions Check: Non-admins only see tasks they created or are assigned to
        const user = request.user;
        if (!['super_admin', 'admin'].includes(user.role)) {
            query.$or = [
                { assignedTo: user._id },
                { createdBy: user._id }
            ];
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (createdBy) query.createdBy = createdBy;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [tasks, total] = await Promise.all([
            Task.find(query)
                .populate('assignedTo', 'fullName role email branch')
                .populate('createdBy', 'fullName role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Task.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: tasks,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch tasks.' });
    }
};

export const getTaskById = async (request, reply) => {
    try {
        const task = await Task.findById(request.params.id)
            .populate('assignedTo', 'fullName role email')
            .populate('createdBy', 'fullName role');
            
        if (!task) return reply.code(404).send({ success: false, message: 'Task not found.' });

        // Access check
        const user = request.user;
        if (!['super_admin', 'admin'].includes(user.role)) {
            if (task.assignedTo._id.toString() !== user._id.toString() && task.createdBy._id.toString() !== user._id.toString()) {
                return reply.code(403).send({ success: false, message: 'Unauthorized access to this task.' });
            }
        }

        return reply.code(200).send({ success: true, data: task });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to find task.' });
    }
};

export const createTask = async (request, reply) => {
    try {
        const taskData = {
            ...request.body,
            createdBy: request.user._id
        };

        const task = await Task.create(taskData);
        const populated = await task.populate([
            { path: 'assignedTo', select: 'fullName role' },
            { path: 'createdBy', select: 'fullName role' }
        ]);

        return reply.code(201).send({ success: true, message: 'Task created successfully.', data: populated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create task.' });
    }
};

export const updateTask = async (request, reply) => {
    try {
        const { id } = request.params;
        const task = await Task.findById(id);
        if (!task) return reply.code(404).send({ success: false, message: 'Task not found.' });

        // Access check: Only creator or admin can update details (assignee can only update status usually, handled by updateTaskStatus)
        const user = request.user;
        if (!['super_admin', 'admin'].includes(user.role) && task.createdBy.toString() !== user._id.toString()) {
             return reply.code(403).send({ success: false, message: 'Unauthorized to update this task.' });
        }

        Object.assign(task, request.body);
        await task.save();

        const updated = await Task.findById(id)
            .populate('assignedTo', 'fullName role')
            .populate('createdBy', 'fullName role');

        return reply.send({ success: true, message: 'Task updated successfully.', data: updated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update task.' });
    }
};

export const updateTaskStatus = async (request, reply) => {
    try {
        const { id } = request.params;
        const { status } = request.body;
        const task = await Task.findById(id);
        if (!task) return reply.code(404).send({ success: false, message: 'Task not found.' });

        // Access check: Admin, Creator, or Assignee can update status
        const user = request.user;
        const isAuthorized = ['super_admin', 'admin'].includes(user.role) || 
                             task.createdBy.toString() === user._id.toString() || 
                             task.assignedTo.toString() === user._id.toString();

        if (!isAuthorized) {
            return reply.code(403).send({ success: false, message: 'Unauthorized to update task status.' });
        }

        task.status = status;
        await task.save();

        return reply.send({ success: true, message: 'Task status updated.', data: task });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update task status.' });
    }
};

export const deleteTask = async (request, reply) => {
    try {
        const task = await Task.findById(request.params.id);
        if (!task) return reply.code(404).send({ success: false, message: 'Task not found.' });

        const user = request.user;
        if (!['super_admin', 'admin'].includes(user.role) && task.createdBy.toString() !== user._id.toString()) {
            return reply.code(403).send({ success: false, message: 'Unauthorized to delete this task.' });
        }

        await Task.findByIdAndDelete(request.params.id);
        return reply.send({ success: true, message: 'Task deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete task.' });
    }
};

export const exportTasks = async (request, reply) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'fullName')
            .populate('createdBy', 'fullName')
            .lean();

        const csvData = tasks.map(t => ({
            Title: t.title,
            Description: t.description,
            Priority: t.priority,
            Status: t.status,
            Deadline: t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A',
            'Assigned To': t.assignedTo?.fullName || 'N/A',
            'Created By': t.createdBy?.fullName || 'N/A',
            'Completed At': t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'N/A'
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="tasks_export.csv"`);
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export tasks.' });
    }
};

export const importTasks = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            // Very basic import logic - requires title and assignedTo email/id lookup or similar
            // For now, assume simple title/description import as pending
            if (row['Title']) {
                await Task.create({
                    title: row['Title'],
                    description: row['Description'] || '',
                    priority: row['Priority']?.toLowerCase() || 'medium',
                    status: 'pending',
                    createdBy: request.user._id,
                    assignedTo: request.user._id // Default to self if not specified or found
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported ${created} tasks.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import tasks.' });
    }
};
