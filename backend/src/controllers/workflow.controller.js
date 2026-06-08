import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import WorkflowRule from '../models/WorkflowRule.js';
import logger from '../services/logger.service.js';

/**
 * GET /workflow-rules
 */
export const getAllWorkflowRules = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, triggerEvent, isActive, branch } = request.query;
        const query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (triggerEvent) query.triggerEvent = triggerEvent;
        if (isActive !== undefined) query.isActive = isActive === 'true' || isActive === true;
        if (branch) query.branch = branch;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [rules, total] = await Promise.all([
            WorkflowRule.find(query)
                .populate('branch', 'name')
                .populate('createdBy', 'fullName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            WorkflowRule.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: rules,
            pagination: { total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch workflow rules.' });
    }
};

/**
 * GET /workflow-rules/:id
 */
export const getWorkflowRuleById = async (request, reply) => {
    try {
        const rule = await WorkflowRule.findById(request.params.id)
            .populate('branch', 'name')
            .populate('createdBy', 'fullName');
        if (!rule) return reply.code(404).send({ success: false, message: 'Workflow rule not found.' });
        return reply.send({ success: true, data: rule });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch workflow rule.' });
    }
};

/**
 * POST /workflow-rules
 */
export const createWorkflowRule = async (request, reply) => {
    try {
        const rule = await WorkflowRule.create({
            ...request.body,
            createdBy: request.user._id
        });

        const populated = await rule.populate([
            { path: 'branch', select: 'name' },
            { path: 'createdBy', select: 'fullName' }
        ]);

        return reply.code(201).send({ success: true, message: 'Workflow rule created successfully.', data: populated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create workflow rule.' });
    }
};

/**
 * PUT /workflow-rules/:id
 */
export const updateWorkflowRule = async (request, reply) => {
    try {
        const rule = await WorkflowRule.findById(request.params.id);
        if (!rule) return reply.code(404).send({ success: false, message: 'Workflow rule not found.' });

        Object.assign(rule, request.body);
        await rule.save();

        const updated = await WorkflowRule.findById(request.params.id)
            .populate('branch', 'name')
            .populate('createdBy', 'fullName');

        return reply.send({ success: true, message: 'Workflow rule updated successfully.', data: updated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update workflow rule.' });
    }
};

/**
 * DELETE /workflow-rules/:id
 */
export const deleteWorkflowRule = async (request, reply) => {
    try {
        const rule = await WorkflowRule.findByIdAndDelete(request.params.id);
        if (!rule) return reply.code(404).send({ success: false, message: 'Workflow rule not found.' });
        return reply.send({ success: true, message: 'Workflow rule deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete workflow rule.' });
    }
};

/**
 * PATCH /workflow-rules/:id/toggle
 * Toggle active/inactive status.
 */
export const toggleWorkflowRule = async (request, reply) => {
    try {
        const rule = await WorkflowRule.findById(request.params.id);
        if (!rule) return reply.code(404).send({ success: false, message: 'Workflow rule not found.' });
        rule.isActive = !rule.isActive;
        await rule.save();
        return reply.send({ success: true, message: `Workflow rule ${rule.isActive ? 'activated' : 'deactivated'}.`, data: rule });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to toggle workflow rule.' });
    }
};

/**
 * GET /workflow-rules/export
 */
export const exportWorkflowRules = async (request, reply) => {
    try {
        const rules = await WorkflowRule.find().populate('branch', 'name').lean();
        const csvData = rules.map(r => ({
            Name: r.name,
            Description: r.description || '',
            'Trigger Event': r.triggerEvent,
            'Is Active': r.isActive ? 'Yes' : 'No',
            'Actions Count': r.actions?.length || 0,
            'Conditions Count': r.conditions?.length || 0,
            'Execution Count': r.executionCount,
            Branch: r.branch?.name || 'Global'
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="workflow_rules.csv"');
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export workflow rules.' });
    }
};

/**
 * POST /workflow-rules/import
 */
export const importWorkflowRules = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Name'] && row['Trigger Event']) {
                await WorkflowRule.create({
                    name: row['Name'],
                    description: row['Description'] || '',
                    triggerEvent: row['Trigger Event'],
                    isActive: row['Is Active']?.toLowerCase() !== 'no',
                    actions: [],
                    conditions: [],
                    createdBy: request.user._id
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported ${created} workflow rules.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import workflow rules.' });
    }
};
