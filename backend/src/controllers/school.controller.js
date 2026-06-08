import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import School from '../models/School.js';
import logger from '../services/logger.service.js';
import { sendWelcomeCredentials } from '../services/notification.service.js';

export const getAllSchools = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, country, region, city, branch } = request.query;
        
        const query = {};

        // Branch localization
        if (request.user.role === 'branch' && request.user.branch) {
            query.branch = request.user.branch;
        } else if (branch) {
            query.branch = branch;
        }

        if (search) {
            query.$or = [
                { nameEn: { $regex: search, $options: 'i' } },
                { nameJp: { $regex: search, $options: 'i' } }
            ];
        }
        if (country) query.country = country;
        if (region) query.region = region;
        if (city) query.city = city;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [schools, total] = await Promise.all([
            School.find(query)
                .populate('branch', 'name')
                .sort({ nameEn: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            School.countDocuments(query)
        ]);
        
        return reply.code(200).send({
            success: true,
            data: schools,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch schools.' });
    }
};

export const getSchoolById = async (request, reply) => {
    try {
        const school = await School.findById(request.params.id);
        if (!school) return reply.code(404).send({ success: false, message: 'School not found.' });
        return reply.code(200).send({ success: true, data: school });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to find school.' });
    }
};

export const createSchool = async (request, reply) => {
    try {
        const school = await School.create(request.body);

        if (request.user) {
            const rawPass = request.body.password || 'school2026';
            const schoolData = { ...school.toObject(), fullName: school.nameEn };
            sendWelcomeCredentials('School Portal', schoolData, rawPass, {
                _id: request.user._id,
                role: request.user.role,
                branch: request.user.branch
            }).catch(e => logger.error(e, 'sendWelcomeCredentials error'));
        }

        return reply.code(201).send({ success: true, message: 'School created successfully.', data: school });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create school.' });
    }
};

export const updateSchool = async (request, reply) => {
    try {
        const school = await School.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
        if (!school) return reply.code(404).send({ success: false, message: 'School not found.' });
        return reply.send({ success: true, message: 'School updated successfully.', data: school });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update school.' });
    }
};

export const deleteSchool = async (request, reply) => {
    try {
        const school = await School.findByIdAndDelete(request.params.id);
        if (!school) return reply.code(404).send({ success: false, message: 'School not found.' });
        return reply.send({ success: true, message: 'School deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete school.' });
    }
};

export const exportSchools = async (request, reply) => {
    try {
        const schools = await School.find().populate('branch', 'name').lean();
        
        const csvData = schools.map(s => ({
            'Name EN': s.nameEn,
            'Name JP': s.nameJp || '',
            City: s.city || '',
            Country: s.country || '',
            Website: s.website || '',
            Region: s.region || '',
            Contact: s.contactPerson || '',
            Email: s.email || '',
            Phone: s.phone || '',
            Branch: s.branch?.name || '',
            'Dormitory': s.hasDormitory ? 'Yes' : 'No'
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="schools_export_${new Date().toISOString().split('T')[0]}.csv"`);

        const outputStream = stringify(csvData, { header: true });
        return reply.send(outputStream);
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export schools.' });
    }
};

export const importSchools = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        const operations = [];
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            const name = row['Name EN'];
            if (name) {
                operations.push({
                    updateOne: {
                        filter: { nameEn: name },
                        update: {
                            nameJp: row['Name JP'],
                            city: row['City'],
                            country: row['Country'],
                            website: row['Website'],
                            region: row['Region'],
                            contactPerson: row['Contact'],
                            email: row['Email'],
                            phone: row['Phone'],
                            hasDormitory: row['Dormitory'] === 'Yes'
                        },
                        upsert: true
                    }
                });
            }
        }

        if (operations.length > 0) {
            await School.bulkWrite(operations);
        }

        return reply.send({ success: true, message: `Imported/Updated ${operations.length} schools.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import schools.' });
    }
};
