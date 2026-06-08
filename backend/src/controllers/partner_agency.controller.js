import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import PartnerAgency from '../models/PartnerAgency.js';
import logger from '../services/logger.service.js';
import { sendWelcomeCredentials } from '../services/notification.service.js';

export const getAllAgencies = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, type, isActive, branch, startDate, endDate } = request.query;
        const query = {};

        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive;
        if (branch) query.branch = branch;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { agencyName: { $regex: search, $options: 'i' } },
                { ownerName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [agencies, total] = await Promise.all([
            PartnerAgency.find(query)
                .populate('branch', 'name')
                .sort({ agencyName: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PartnerAgency.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: agencies,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch partner agencies.' });
    }
};

export const getAgencyById = async (request, reply) => {
    try {
        const { id } = request.params;
        const agency = await PartnerAgency.findById(id).populate('branch', 'name');
        if (!agency) return reply.code(404).send({ success: false, message: 'Partner agency not found.' });
        return reply.send({ success: true, data: agency });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch agency details.' });
    }
};

export const createAgency = async (request, reply) => {
    try {
        const agency = await PartnerAgency.create(request.body);

        if (request.user) {
            const rawPass = request.body.password || 'agency2026';
            const agencyData = { ...agency.toObject(), fullName: agency.agencyName };
            sendWelcomeCredentials('Partner Agency', agencyData, rawPass, {
                _id: request.user._id,
                role: request.user.role,
                branch: request.user.branch
            }).catch(e => logger.error(e, 'sendWelcomeCredentials error'));
        }

        return reply.code(201).send({ success: true, message: 'Partner agency created successfully.', data: agency });
    } catch (error) {
        logger.error(error);
        if (error.code === 11000) {
            return reply.code(400).send({ success: false, message: 'Agency name or email already exists.' });
        }
        return reply.code(500).send({ success: false, message: 'Failed to create partner agency.' });
    }
};

export const updateAgency = async (request, reply) => {
    try {
        const { id } = request.params;
        const agency = await PartnerAgency.findByIdAndUpdate(id, request.body, { new: true, runValidators: true });
        if (!agency) return reply.code(404).send({ success: false, message: 'Partner agency not found.' });
        return reply.send({ success: true, message: 'Partner agency updated successfully.', data: agency });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update partner agency.' });
    }
};

export const deleteAgency = async (request, reply) => {
    try {
        const { id } = request.params;
        const agency = await PartnerAgency.findByIdAndDelete(id);
        if (!agency) return reply.code(404).send({ success: false, message: 'Partner agency not found.' });
        return reply.send({ success: true, message: 'Partner agency deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete partner agency.' });
    }
};

export const exportAgencies = async (request, reply) => {
    try {
        const agencies = await PartnerAgency.find().populate('branch', 'name').lean();
        const csvData = agencies.map(a => ({
            'Agency Name': a.agencyName,
            'Owner Name': a.ownerName,
            Email: a.email,
            Phone: a.phone,
            Type: a.type,
            'Commission Rate': a.commissionRate,
            Status: a.isActive ? 'Active' : 'Inactive',
            Branch: a.branch?.name || 'Central',
            Website: a.website || '',
            Address: a.address || ''
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="partner_agencies.csv"');
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export partner agencies.' });
    }
};

export const importAgencies = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let createdCount = 0;
        let updatedCount = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Agency Name'] && row['Email']) {
                const existing = await PartnerAgency.findOne({ email: row['Email'].toLowerCase() });
                const agencyData = {
                    agencyName: row['Agency Name'],
                    ownerName: row['Owner Name'] || row['Agency Name'],
                    email: row['Email'].toLowerCase(),
                    phone: row['Phone'] || '0000000000',
                    type: row['Type']?.toLowerCase() || 'agent',
                    commissionRate: parseFloat(row['Commission Rate']) || 0,
                    isActive: row['Status']?.toLowerCase() !== 'inactive',
                    website: row['Website'],
                    address: row['Address']
                };

                if (existing) {
                    await PartnerAgency.findByIdAndUpdate(existing._id, agencyData);
                    updatedCount++;
                } else {
                    await PartnerAgency.create(agencyData);
                    createdCount++;
                }
            }
        }

        return reply.send({ 
            success: true, 
            message: `Import completed. Created: ${createdCount}, Updated: ${updatedCount}` 
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import partner agencies.' });
    }
};
