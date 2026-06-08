import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Event from '../models/Event.js';
import Setting from '../models/Setting.js';
import logger from '../services/logger.service.js';

export const getAllEvents = async (request, reply) => {
    try {
        const { page = 1, limit = 50, search, category, branch, status, startDate, endDate } = request.query;
        const query = {};

        if (request.user.role === 'branch' && request.user.branch) {
            query.$or = [
                { branch: request.user.branch },
                { branch: null } // Global events
            ];
        } else if (branch) {
            query.branch = branch;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        
        if (category) query.category = category;
        if (status) query.status = status;

        // Date range filtering (for calendar views)
        // Find events that overlap with the requested range
        if (startDate || endDate) {
            query.$and = [];
            if (startDate) {
                // Event ends after the search range starts
                query.$and.push({ endDate: { $gte: new Date(startDate) } });
            }
            if (endDate) {
                // Event starts before the search range ends
                query.$and.push({ startDate: { $lte: new Date(endDate) } });
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [events, total] = await Promise.all([
            Event.find(query)
                .populate('branch', 'name')
                .populate('recordedBy', 'fullName')
                .sort({ startDate: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Event.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: events,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch events.' });
    }
};

export const createEvent = async (request, reply) => {
    try {
        const { category } = request.body;
        
        // Validate category against system settings
        const settings = await Setting.findOne();
        if (settings && settings.event_categories && settings.event_categories.length > 0) {
            if (!settings.event_categories.includes(category)) {
                return reply.code(400).send({ 
                    success: false, 
                    message: `Invalid category. Allowed categories: ${settings.event_categories.join(', ')}` 
                });
            }
        }

        const eventData = {
            ...request.body,
            recordedBy: request.user._id
        };

        const event = await Event.create(eventData);
        const populated = await event.populate([
            { path: 'branch', select: 'name' },
            { path: 'recordedBy', select: 'fullName' }
        ]);

        return reply.code(201).send({ success: true, message: 'Event scheduled successfully.', data: populated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to schedule event.' });
    }
};

export const updateEvent = async (request, reply) => {
    try {
        const { id } = request.params;
        const event = await Event.findById(id);
        if (!event) return reply.code(404).send({ success: false, message: 'Event not found.' });

        // Basic permission: only super_admin/admin or the person who recorded it can update
        if (!['super_admin', 'admin'].includes(request.user.role) && event.recordedBy.toString() !== request.user._id.toString()) {
            return reply.code(403).send({ success: false, message: 'Unauthorized to update this event.' });
        }

        if (request.body.category) {
            const settings = await Setting.findOne();
            if (settings && settings.event_categories && settings.event_categories.length > 0) {
                if (!settings.event_categories.includes(request.body.category)) {
                    return reply.code(400).send({ 
                        success: false, 
                        message: `Invalid category. Allowed categories: ${settings.event_categories.join(', ')}` 
                    });
                }
            }
        }

        Object.assign(event, request.body);
        await event.save();

        const updated = await Event.findById(id)
            .populate('branch', 'name')
            .populate('recordedBy', 'fullName');

        return reply.send({ success: true, message: 'Event updated successfully.', data: updated });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update event.' });
    }
};

export const deleteEvent = async (request, reply) => {
    try {
        const event = await Event.findById(request.params.id);
        if (!event) return reply.code(404).send({ success: false, message: 'Event not found.' });

        if (!['super_admin', 'admin'].includes(request.user.role) && event.recordedBy.toString() !== request.user._id.toString()) {
            return reply.code(403).send({ success: false, message: 'Unauthorized to delete this event.' });
        }

        await Event.findByIdAndDelete(request.params.id);
        return reply.send({ success: true, message: 'Event deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete event.' });
    }
};

export const exportEvents = async (request, reply) => {
    try {
        const events = await Event.find().populate('branch', 'name').lean();

        const csvData = events.map(e => ({
            Title: e.title,
            Category: e.category,
            Description: e.description || '',
            'Start Date': new Date(e.startDate).toLocaleString(),
            'End Date': new Date(e.endDate).toLocaleString(),
            Location: e.location || '',
            Branch: e.branch?.name || 'Global',
            Status: e.status
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="calendar_events.csv"`);
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export calendar.' });
    }
};

export const importEvents = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));
        
        const settings = await Setting.findOne();
        const allowedCategories = settings?.event_categories || [];
        const defaultCategory = allowedCategories.length > 0 ? allowedCategories[0] : 'General';

        for await (const row of parser) {
            if (row['Title'] && row['Start Date']) {
                let category = row['Category'];
                if (!allowedCategories.includes(category)) {
                    category = defaultCategory;
                }

                await Event.create({
                    title: row['Title'],
                    category: category,
                    description: row['Description'] || '',
                    startDate: new Date(row['Start Date']),
                    endDate: row['End Date'] ? new Date(row['End Date']) : new Date(row['Start Date']),
                    location: row['Location'] || '',
                    branch: null, // Default to global on import unless specified
                    recordedBy: request.user._id,
                    status: row['Status']?.toLowerCase() || 'scheduled'
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Imported ${created} events.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import events.' });
    }
};
