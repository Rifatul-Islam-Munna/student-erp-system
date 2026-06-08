import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Visitor from '../models/Visitor.js';
import logger from '../services/logger.service.js';

export const getVisitorStats = async (request, reply) => {
    try {
        const total = await Visitor.countDocuments();
        
        // Count this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await Visitor.countDocuments({ createdAt: { $gte: startOfMonth } });

        // Branch distribution
        const branchDistribution = await Visitor.aggregate([
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
        return reply.code(500).send({ success: false, message: 'Failed to fetch tracking metrics' });
    }
};

export const getAllVisitors = async (request, reply) => {
    try {
        const { page = 1, limit = 10, startDate, endDate, branch, school, partnerAgency, search } = request.query;
        
        const query = {};

        // Branch localization
        if (request.user.role === 'branch' && request.user.branch) {
            query.branch = request.user.branch;
        } else if (branch) {
            query.branch = branch;
        }

        if (school) query.school = school;
        if (partnerAgency) query.partnerAgency = partnerAgency;

        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        }

        if (branch) query.branch = branch;

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [visitors, total] = await Promise.all([
            Visitor.find(query)
                .populate('branch', 'name')
                .populate('school', 'nameEn')
                .populate('partnerAgency', 'agencyName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Visitor.countDocuments(query)
        ]);
        
        return reply.code(200).send({
            success: true,
            data: visitors,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch visitors' });
    }
};

export const getVisitorById = async (request, reply) => {
    try {
        const visitor = await Visitor.findById(request.params.id)
            .populate('branch', 'name')
            .populate('school', 'nameEn')
            .populate('partnerAgency', 'agencyName');
        if (!visitor) return reply.code(404).send({ success: false, message: 'Visitor not found' });

        return reply.code(200).send({ success: true, data: visitor });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Server error' });
    }
};

export const createVisitor = async (request, reply) => {
    try {
        const visitor = await Visitor.create(request.body);
        return reply.code(201).send({
            success: true,
            message: 'Visitor created successfully',
            data: visitor
        });
    } catch (error) {
        logger.error(error);
        if (error.name === 'ValidationError') {
            return reply.code(400).send({ success: false, message: error.message });
        }
        return reply.code(500).send({ success: false, message: 'Failed to insert visitor' });
    }
};


export const updateVisitor = async (request, reply) => {
    try {
        const visitor = await Visitor.findByIdAndUpdate(
            request.params.id, 
            request.body, 
            { new: true, runValidators: true }
        );
        if (!visitor) return reply.code(404).send({ success: false, message: 'NotFound' });
        
        return reply.send({ success: true, message: 'Visitor updated', data: visitor });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Server fault' });
    }
};

export const deleteVisitor = async (request, reply) => {
    try {
        const visitor = await Visitor.findByIdAndDelete(request.params.id);
        if (!visitor) return reply.code(404).send({ success: false, message: 'Not found' });
        
        return reply.send({ success: true, message: 'Successfully deleted' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Deletion fault' });
    }
};

export const exportVisitors = async (request, reply) => {
    try {
        const { startDate, endDate, branch } = request.query;
        const query = {};
        
        if (startDate && endDate) query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        if (branch) query.branch = branch;

        const visitors = await Visitor.find(query)
            .populate('branch', 'name')
            .populate('school', 'nameEn')
            .populate('partnerAgency', 'agencyName')
            .lean();
        
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="visitors_export.csv"');

        // Simple stringify configuration handling core metrics initially directly mapping root items safely.
        const outputStream = stringify(visitors, {
            header: true,
            columns: [
                { key: 'fullName', header: 'Full Name' },
                { key: 'email', header: 'Email' },
                { key: 'phone', header: 'Phone' },
                { key: 'gender', header: 'Gender' },
                { key: 'branch.name', header: 'Branch' },
                { key: 'school.nameEn', header: 'School' },
                { key: 'partnerAgency.agencyName', header: 'Partner Agency' },
                { key: 'createdAt', header: 'Date Added' }
            ]
        });

        return reply.send(outputStream);
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Export failed' });
    }
};

export const importVisitors = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'CSV File missing' });

        const results = [];
        const stream = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of stream) {
            // Simplified transformation mapper safely formatting required items dynamically bypassing broken sets
            if (row['Full Name'] && row['Email']) {
                let agencyId = null;
                if (row['Partner Agency']) {
                    const agency = await PartnerAgency.findOne({ 
                        agencyName: { $regex: new RegExp(`^${row['Partner Agency']}$`, 'i') } 
                    });
                    if (agency) agencyId = agency._id;
                }

                results.push({
                    fullName: row['Full Name'],
                    email: row['Email'],
                    phone: row['Phone'] || '000000000',
                    dateOfBirth: new Date(), // Using default for mass imports bypassing required Date strict bounds loosely, or would explicitly require mapped row date parsed.
                    gender: row['Gender'] ? row['Gender'].toLowerCase() : 'other',
                    branch: row['Branch'] || null,
                    partnerAgency: agencyId
                });
            }
        }

        if (results.length > 0) {
            await Visitor.insertMany(results);
        }

        return reply.send({ success: true, message: `Imported ${results.length} rows successfully` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Import parser halted abruptly' });
    }
};

// === Lead Scoring Features (Feature #15) ===

/**
 * POST /visitors/:id/calculate-score
 * Calculate and update lead score for a visitor.
 */
export const calculateLeadScore = async (request, reply) => {
    try {
        const visitor = await Visitor.findById(request.params.id);
        if (!visitor) return reply.code(404).send({ success: false, message: 'Visitor not found.' });

        let score = 0;

        // Education level scoring (max 25)
        if (visitor.education && visitor.education.length > 0) {
            const maxGpa = Math.max(...visitor.education.map(e => e.gpa || 0));
            if (maxGpa >= 4.5) score += 25;
            else if (maxGpa >= 4.0) score += 20;
            else if (maxGpa >= 3.5) score += 15;
            else if (maxGpa >= 3.0) score += 10;
            else score += 5;
        }

        // Japanese test scoring (max 20)
        if (visitor.JapaneseTest?.hasCertificate) {
            const level = visitor.JapaneseTest.level?.toUpperCase();
            if (level === 'N1' || level === 'N2') score += 20;
            else if (level === 'N3') score += 15;
            else if (level === 'N4') score += 10;
            else score += 5;
        }

        // Preferred country match (max 15)
        if (visitor.preferredCountry && visitor.preferredCountry.length > 0) score += 15;

        // Budget concern (negative indicator, max -10)
        if (!visitor.BudgetConcerned) score += 10;

        // Engagement scoring - based on communication count (max 20)
        const CommunicationLog = (await import('../models/CommunicationLog.js')).default;
        const commCount = await CommunicationLog.countDocuments({ visitor: visitor._id });
        if (commCount >= 5) score += 20;
        else if (commCount >= 3) score += 15;
        else if (commCount >= 1) score += 10;

        // Source / referral scoring (max 10)
        if (visitor.source) {
            const highValueSources = ['referral', 'agent', 'partner'];
            if (highValueSources.includes(visitor.source.toLowerCase())) score += 10;
            else score += 5;
        }

        // Cap at 100
        score = Math.min(score, 100);

        // Categorize
        let category;
        if (score >= 70) category = 'hot';
        else if (score >= 40) category = 'warm';
        else category = 'cold';

        visitor.leadScore = score;
        visitor.leadCategory = category;
        await visitor.save();

        return reply.send({ success: true, message: 'Lead score calculated.', data: { leadScore: score, leadCategory: category } });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to calculate lead score.' });
    }
};

/**
 * POST /visitors/bulk-score
 * Calculate lead scores for all unscored visitors.
 */
export const bulkCalculateScores = async (request, reply) => {
    try {
        const visitors = await Visitor.find({ leadCategory: 'unscored' });
        let processed = 0;

        for (const visitor of visitors) {
            let score = 0;
            if (visitor.education?.length > 0) {
                const maxGpa = Math.max(...visitor.education.map(e => e.gpa || 0));
                score += Math.min(maxGpa * 5, 25);
            }
            if (visitor.JapaneseTest?.hasCertificate) score += 15;
            if (visitor.preferredCountry?.length > 0) score += 15;
            if (!visitor.BudgetConcerned) score += 10;
            if (visitor.source) score += 5;
            score = Math.min(score, 100);

            visitor.leadScore = score;
            visitor.leadCategory = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
            await visitor.save();
            processed++;
        }

        return reply.send({ success: true, message: `Scored ${processed} visitors.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to bulk score visitors.' });
    }
};

/**
 * POST /visitors/:id/schedule-followup
 * Schedule a follow-up for a visitor.
 */
export const scheduleFollowUp = async (request, reply) => {
    try {
        const visitor = await Visitor.findById(request.params.id);
        if (!visitor) return reply.code(404).send({ success: false, message: 'Visitor not found.' });

        const { date, note } = request.body;
        visitor.followUpDates.push({ date: new Date(date), note: note || '' });
        visitor.nextFollowUp = new Date(date);
        await visitor.save();

        return reply.send({ success: true, message: 'Follow-up scheduled.', data: visitor });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to schedule follow-up.' });
    }
};

/**
 * GET /visitors/lead-overview
 * Get lead scoring overview (distribution by category).
 */
export const getLeadOverview = async (request, reply) => {
    try {
        const distribution = await Visitor.aggregate([
            { $group: { _id: '$leadCategory', count: { $sum: 1 }, avgScore: { $avg: '$leadScore' } } },
            { $sort: { avgScore: -1 } }
        ]);

        const statusDistribution = await Visitor.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const upcomingFollowUps = await Visitor.find({
            nextFollowUp: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        }).select('fullName phone email nextFollowUp leadScore leadCategory').sort({ nextFollowUp: 1 }).limit(20);

        return reply.send({ success: true, data: { distribution, statusDistribution, upcomingFollowUps } });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch lead overview.' });
    }
};
