import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import User from '../models/User.js';
import logger from '../services/logger.service.js';
import { sendWelcomeCredentials } from '../services/notification.service.js';

export const getAllUsers = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, role, accountStatus, startDate, endDate } = request.query;
        const query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;
        if (accountStatus) query.accountStatus = accountStatus;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -resetPasswordToken -resetPasswordExpires')
                .populate('branch', 'branchName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: users,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch users.' });
    }
};

export const getUserById = async (request, reply) => {
    try {
        const user = await User.findById(request.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .populate('branch');
        if (!user) return reply.code(404).send({ success: false, message: 'User not found.' });
        return reply.code(200).send({ success: true, data: user });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to find user.' });
    }
};

export const createUser = async (request, reply) => {
    try {
        const { fullName, email, password, phone, role, accountStatus, permissions, branch, address, commissionType, commissionAmount } = request.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return reply.code(409).send({ success: false, message: 'Email already registered.' });
        }

        // If no explicit permissions, use role defaults
        const finalPermissions = permissions && permissions.length > 0
            ? permissions
            : User.getDefaultPermissions(role);

        const user = await User.create({
            fullName, email, password, phone,
            role, accountStatus,
            permissions: finalPermissions,
            branch: branch || null,
            address: address || null,
            commissionType: commissionType || '',
            commissionAmount: commissionAmount || 0
        });

        // Fire notification in the background
        if (request.user) {
            sendWelcomeCredentials(user.role.charAt(0).toUpperCase() + user.role.slice(1), user, password, {
                _id: request.user._id,
                role: request.user.role,
                branch: request.user.branch
            }).catch(e => logger.error(e, 'sendWelcomeCredentials error'));
        }

        return reply.code(201).send({ success: true, message: 'User created successfully.', data: user.toJSON() });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to create user.' });
    }
};

export const updateUser = async (request, reply) => {
    try {
        const { id } = request.params;
        const updateData = { ...request.body };

        // Don't allow direct password updates via this route
        delete updateData.password;

        const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .select('-password -resetPasswordToken -resetPasswordExpires');
        if (!user) return reply.code(404).send({ success: false, message: 'User not found.' });

        return reply.send({ success: true, message: 'User updated successfully.', data: user });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update user.' });
    }
};

export const deleteUser = async (request, reply) => {
    try {
        const user = await User.findByIdAndDelete(request.params.id);
        if (!user) return reply.code(404).send({ success: false, message: 'User not found.' });
        return reply.send({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete user.' });
    }
};

// --- LIST AGENTS / COUNSELORS (dropdown helpers) ---

export const getAgents = async (request, reply) => {
    try {
        const agents = await User.find({ role: 'agent', accountStatus: 'active' })
            .select('fullName email phone commissionType commissionAmount address');
        return reply.send({ success: true, data: agents });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch agents.' });
    }
};

export const getCounselors = async (request, reply) => {
    try {
        const counselors = await User.find({ role: 'counselor', accountStatus: 'active' })
            .select('fullName email phone');
        return reply.send({ success: true, data: counselors });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch counselors.' });
    }
};

export const getBranchUsers = async (request, reply) => {
    try {
        const branches = await User.find({ role: 'branch', accountStatus: 'active' })
            .select('fullName email phone');
        return reply.send({ success: true, data: branches });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch branch users.' });
    }
};

export const searchTaskTargets = async (request, reply) => {
    try {
        const { search = '' } = request.query;
        const query = {
            role: { $in: ['branch', 'agent', 'counselor'] },
            accountStatus: 'active'
        };

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('fullName email role phone')
            .limit(20);

        return reply.send({ success: true, data: users });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to search task targets.' });
    }
};

// --- EXPORT / IMPORT ---

export const exportUsers = async (request, reply) => {
    try {
        const users = await User.find()
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .lean();

        const csvData = users.map(u => ({
            'Full Name': u.fullName,
            Email: u.email,
            Phone: u.phone || '',
            Role: u.role,
            Status: u.accountStatus,
            Address: u.address || '',
            'Commission Type': u.commissionType || '',
            'Commission Amount': u.commissionAmount || 0,
            'Total Earnings': u.totalEarnings || 0
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`);
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export users.' });
    }
};

export const importUsers = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let created = 0;
        let skipped = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            const email = row['Email'];
            if (!email) { skipped++; continue; }

            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing) {
                // Update existing (no password change)
                existing.fullName = row['Full Name'] || existing.fullName;
                existing.phone = row['Phone'] || existing.phone;
                existing.role = row['Role'] || existing.role;
                existing.accountStatus = row['Status'] || existing.accountStatus;
                existing.address = row['Address'] || existing.address;
                existing.commissionType = row['Commission Type'] || existing.commissionType;
                existing.commissionAmount = row['Commission Amount'] ? parseFloat(row['Commission Amount']) : existing.commissionAmount;
                await existing.save({ validateModifiedOnly: true });
                created++;
            } else {
                // Create new with a default password
                const role = row['Role'] || 'student';
                await User.create({
                    fullName: row['Full Name'],
                    email: email.toLowerCase(),
                    password: 'changeme123',
                    phone: row['Phone'] || null,
                    role,
                    accountStatus: row['Status'] || 'active',
                    address: row['Address'] || null,
                    commissionType: row['Commission Type'] || '',
                    commissionAmount: row['Commission Amount'] ? parseFloat(row['Commission Amount']) : 0,
                    permissions: User.getDefaultPermissions(role)
                });
                created++;
            }
        }

        return reply.send({ success: true, message: `Processed ${created} users, skipped ${skipped}.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import users.' });
    }
};
