import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import User from '../models/User.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import logger from '../services/logger.service.js';
import mongoose from 'mongoose';
import { sendWelcomeCredentials } from '../services/notification.service.js';

export const getAllTeachers = async (request, reply) => {
    try {
        const { page = 1, limit = 50, search, branch, school, accountStatus } = request.query;
        
        // Find users with role 'teacher'
        const query = { role: 'teacher' };

        // Branch localization
        if (request.user.role === 'branch' && request.user.branch) {
            query.branch = request.user.branch;
        } else if (branch) {
            query.branch = branch;
        }

        if (school) query.school = school;
        if (accountStatus) query.accountStatus = accountStatus;

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [teachers, total] = await Promise.all([
            User.find(query)
                .populate('branch', 'name')
                .populate('school', 'nameEn')
                .select('-password')
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        // Fetch EmployeeProfiles for these teachers
        const teacherIds = teachers.map(t => t._id);
        const profiles = await EmployeeProfile.find({ user: { $in: teacherIds } }).lean();
        
        // Merge profiles into teacher objects
        const teachersWithProfiles = teachers.map(teacher => ({
            ...teacher,
            profile: profiles.find(p => p.user.toString() === teacher._id.toString()) || null
        }));

        return reply.code(200).send({
            success: true,
            data: teachersWithProfiles,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch teachers.' });
    }
};

export const upsertTeacher = async (request, reply) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { email, employeeId, ...teacherData } = request.body;
        const { id } = request.params; // For updates

        let user;
        if (id) {
            user = await User.findById(id).session(session);
            if (!user) throw new Error('Teacher not found');
            Object.assign(user, teacherData);
            if (email) user.email = email;
            await user.save({ session });
        } else {
            // Check if user exists
            const existing = await User.findOne({ email }).session(session);
            if (existing) {
                await session.abortTransaction();
                return reply.code(400).send({ success: false, message: 'User with this email already exists.' });
            }
            user = await User.create([{
                ...teacherData,
                email,
                role: 'teacher'
            }], { session });
            user = user[0];

            // Send Notification for new teacher
            if (request.user) {
                const rawPass = request.body.password || 'teacher123';
                sendWelcomeCredentials('Teacher', user, rawPass, {
                    _id: request.user._id,
                    role: request.user.role,
                    branch: request.user.branch
                }).catch(e => logger.error(e, 'sendWelcomeCredentials error'));
            }
        }

        // Upsert EmployeeProfile
        const profileData = {
            user: user._id,
            employeeId,
            designation: teacherData.designation,
            department: teacherData.department,
            joiningDate: teacherData.joiningDate,
            emergencyContact: teacherData.emergencyContact,
            bankDetails: teacherData.bankDetails
        };

        await EmployeeProfile.findOneAndUpdate(
            { user: user._id },
            profileData,
            { upsert: true, session, new: true, runValidators: true }
        );

        await session.commitTransaction();
        return reply.send({ success: true, message: `Teacher ${id ? 'updated' : 'created'} successfully.` });
    } catch (error) {
        await session.abortTransaction();
        logger.error(error);
        return reply.code(500).send({ success: false, message: error.message || 'Failed to upsert teacher.' });
    } finally {
        session.endSession();
    }
};

export const exportTeachers = async (request, reply) => {
    try {
        const users = await User.find({ role: 'teacher' })
            .populate('branch', 'name')
            .populate('school', 'nameEn')
            .lean();
        
        const userIds = users.map(u => u._id);
        const profiles = await EmployeeProfile.find({ user: { $in: userIds } }).lean();

        const csvData = users.map(u => {
            const p = profiles.find(profile => profile.user.toString() === u._id.toString());
            return {
                Name: u.fullName,
                Email: u.email,
                Phone: u.phone || '',
                EmployeeID: p?.employeeId || '',
                Designation: p?.designation || '',
                Department: p?.department || '',
                JoiningDate: p?.joiningDate ? new Date(p.joiningDate).toLocaleDateString() : '',
                Branch: u.branch?.name || '',
                School: u.school?.nameEn || '',
                Status: u.accountStatus
            };
        });

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="teachers_list.csv"');
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export teachers.' });
    }
};

export const importTeachers = async (request, reply) => {
    // Basic import logic - similar to employee import
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let processed = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['Email'] && row['Name']) {
                // Find or create user
                let user = await User.findOne({ email: row['Email'] });
                if (!user) {
                    user = await User.create({
                        fullName: row['Name'],
                        email: row['Email'],
                        role: 'teacher',
                        password: 'ChangeMe123!', // Default password
                        accountStatus: 'active'
                    });
                } else if (user.role !== 'teacher') {
                    user.role = 'teacher';
                    await user.save();
                }

                if (row['EmployeeID']) {
                    await EmployeeProfile.findOneAndUpdate(
                        { user: user._id },
                        {
                            employeeId: row['EmployeeID'],
                            designation: row['Designation'] || 'Teacher',
                            department: row['Department'] || 'Academic',
                            joiningDate: row['JoiningDate'] ? new Date(row['JoiningDate']) : new Date()
                        },
                        { upsert: true }
                    );
                }
                processed++;
            }
        }

        return reply.send({ success: true, message: `Imported/Updated ${processed} teacher records.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import teachers.' });
    }
};
