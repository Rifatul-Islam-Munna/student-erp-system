import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import FAQ from '../models/FAQ.js';
import Setting from '../models/Setting.js';
import logger from '../services/logger.service.js';

export const getAllFAQs = async (request, reply) => {
    try {
        const { page = 1, limit = 50, search, category, branch, isActive, startDate, endDate } = request.query;
        const query = {};

        // Branch localization
        if (request.user.role === 'branch' && request.user.branch) {
            query.$or = [
                { branch: request.user.branch },
                { branch: null } // Global
            ];
        } else if (branch) {
            query.branch = branch;
        }

        if (search) {
            query.$or = query.$or || [];
            query.$or.push(
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } }
            );
        }
        
        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive;

        // Date filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [faqs, total] = await Promise.all([
            FAQ.find(query)
                .populate('branch', 'name')
                .populate('recordedBy', 'fullName')
                .sort({ priority: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            FAQ.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: faqs,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch FAQs.' });
    }
};

export const createFAQ = async (request, reply) => {
    try {
        const { category } = request.body;
        
        // Validate category against system settings
        const settings = await Setting.findOne();
        if (settings && settings.faq_categories && settings.faq_categories.length > 0) {
            if (category && !settings.faq_categories.includes(category)) {
                return reply.code(400).send({ 
                    success: false, 
                    message: `Invalid category. Allowed: ${settings.faq_categories.join(', ')}` 
                });
            }
        }

        const faqData = {
            ...request.body,
            recordedBy: request.user._id
        };

        const faq = await FAQ.create(faqData);
        const populated = await faq.populate([
            { path: 'branch', select: 'name' },
            { path: 'recordedBy', select: 'fullName' }
        ]);

        return reply.code(201).send({ success: true, message: 'FAQ created successfully.', data: populated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create FAQ.' });
    }
};

export const updateFAQ = async (request, reply) => {
    try {
        const { id } = request.params;
        const faq = await FAQ.findById(id);
        if (!faq) return reply.code(404).send({ success: false, message: 'FAQ not found.' });

        if (request.body.category) {
            const settings = await Setting.findOne();
            if (settings && settings.faq_categories && settings.faq_categories.length > 0) {
                if (!settings.faq_categories.includes(request.body.category)) {
                    return reply.code(400).send({ 
                        success: false, 
                        message: `Invalid category. Allowed: ${settings.faq_categories.join(', ')}` 
                    });
                }
            }
        }

        Object.assign(faq, request.body);
        await faq.save();

        const updated = await FAQ.findById(id)
            .populate('branch', 'name')
            .populate('recordedBy', 'fullName');

        return reply.send({ success: true, message: 'FAQ updated successfully.', data: updated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update FAQ.' });
    }
};

export const deleteFAQ = async (request, reply) => {
    try {
        const faq = await FAQ.findById(request.params.id);
        if (!faq) return reply.code(404).send({ success: false, message: 'FAQ not found.' });

        await FAQ.findByIdAndDelete(request.params.id);
        return reply.send({ success: true, message: 'FAQ deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete FAQ.' });
    }
};

export const exportFAQs = async (request, reply) => {
    try {
        const faqs = await FAQ.find().populate('branch', 'name').lean();

        const csvData = faqs.map(f => ({
            Question: f.question,
            Answer: f.answer,
            Category: f.category,
            Branch: f.branch?.name || 'Global',
            Active: f.isActive ? 'Yes' : 'No',
            Priority: f.priority,
            Created: new Date(f.createdAt).toLocaleString()
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="faqs_export.csv"');
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export FAQs.' });
    }
};

export const importFAQs = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        const settings = await Setting.findOne();
        const allowedCategories = settings?.faq_categories || [];
        const defaultCategory = allowedCategories.length > 0 ? allowedCategories[0] : 'General';

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Question'] && row['Answer']) {
                let category = row['Category'];
                if (!allowedCategories.includes(category)) {
                    category = defaultCategory;
                }

                await FAQ.create({
                    question: row['Question'],
                    answer: row['Answer'],
                    category: category,
                    isActive: row['Active']?.toLowerCase() === 'yes',
                    priority: parseInt(row['Priority']) || 0,
                    recordedBy: request.user._id,
                    branch: null // Default to global on import
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported ${created} FAQs.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import FAQs.' });
    }
};
