import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import EmployeeProfile from '../models/EmployeeProfile.js';
import SalaryStructure from '../models/SalaryStructure.js';
import StaffAttendance from '../models/StaffAttendance.js';
import Payroll from '../models/Payroll.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import logger from '../services/logger.service.js';

// Employee Profile Management
export const getAllEmployees = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, department, designation } = request.query;
        const query = {};

        if (department) query.department = department;
        if (designation) query.designation = designation;
        if (search) {
            query.$or = [
                { employeeId: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [employees, total] = await Promise.all([
            EmployeeProfile.find(query)
                .populate('user', 'fullName email role phone avatar')
                .sort({ employeeId: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            EmployeeProfile.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: employees,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch employee profiles.' });
    }
};

export const upsertEmployeeProfile = async (request, reply) => {
    try {
        const { user } = request.body;
        const profile = await EmployeeProfile.findOneAndUpdate(
            { user },
            request.body,
            { upsert: true, new: true, runValidators: true }
        );
        return reply.send({ success: true, message: 'Profile updated successfully.', data: profile });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update HR profile.' });
    }
};

// Salary Structure
export const updateSalaryStructure = async (request, reply) => {
    try {
        const { userId } = request.params;
        const structure = await SalaryStructure.findOneAndUpdate(
            { user: userId },
            request.body,
            { upsert: true, new: true }
        );
        return reply.send({ success: true, message: 'Salary structure updated.', data: structure });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update salary structure.' });
    }
};

// Staff Attendance
export const markAttendance = async (request, reply) => {
    try {
        const { user, date, status, checkIn, checkOut, remarks } = request.body;
        
        // Normalize date to 00:00:00
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const attendance = await StaffAttendance.findOneAndUpdate(
            { user, date: normalizedDate },
            { status, checkIn, checkOut, remarks },
            { upsert: true, new: true }
        );

        return reply.send({ success: true, message: 'Attendance marked.', data: attendance });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to mark attendance.' });
    }
};

export const getStaffAttendance = async (request, reply) => {
    try {
        const { user, month, year } = request.query;
        const query = {};
        if (user) query.user = user;
        
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const attendanceLogs = await StaffAttendance.find(query).sort({ date: 1 });
        return reply.send({ success: true, data: attendanceLogs });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch attendance.' });
    }
};

// Payroll Generation
export const generateMonthlyPayroll = async (request, reply) => {
    try {
        const { month, year } = request.body;
        
        // 1. Get all employees with a salary structure
        const structures = await SalaryStructure.find().populate('user');
        
        let created = 0;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const totalDaysInMonth = endDate.getDate();

        for (const struct of structures) {
            // Check if payroll already exists
            const existing = await Payroll.findOne({ user: struct.user._id, month, year });
            if (existing) continue;

            // 2. Calculate Attendance Deduction
            // Logic: Count 'absent' and 'half_day' logs for the month
            const attendanceLogs = await StaffAttendance.find({
                user: struct.user._id,
                date: { $gte: startDate, $lte: endDate }
            });

            let unpaidDays = 0;
            attendanceLogs.forEach(log => {
                if (log.status === 'absent') unpaidDays += 1;
                if (log.status === 'half_day') unpaidDays += 0.5;
            });

            const dailyRate = struct.basicSalary / totalDaysInMonth;
            const attendanceDeduction = Math.round(unpaidDays * dailyRate);

            const totalAllowances = struct.allowances.reduce((sum, a) => sum + a.amount, 0);
            const totalDeductions = struct.deductions.reduce((sum, d) => sum + d.amount, 0);
            
            const netPayable = struct.basicSalary + totalAllowances - totalDeductions - attendanceDeduction;

            await Payroll.create({
                user: struct.user._id,
                month,
                year,
                basicSalary: struct.basicSalary,
                totalAllowances,
                totalDeductions,
                attendanceDeduction,
                netPayable: Math.max(0, netPayable),
                status: 'unpaid'
            });
            created++;
        }

        return reply.code(201).send({ success: true, message: `Generated payroll for ${created} employees.`, count: created });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to generate payroll.' });
    }
};

export const getPayrollRecords = async (request, reply) => {
    try {
        const { month, year, user, status } = request.query;
        const query = {};
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (user) query.user = user;
        if (status) query.status = status;

        const records = await Payroll.find(query)
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 });

        return reply.send({ success: true, data: records });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch payroll records.' });
    }
};

export const processPayment = async (request, reply) => {
    const session = await Payroll.startSession();
    session.startTransaction();
    try {
        const { id } = request.params;
        const { paidAmount, paymentDate, linkToAccounts } = request.body;

        const payroll = await Payroll.findById(id).populate('user').session(session);
        if (!payroll) {
            await session.abortTransaction();
            return reply.code(404).send({ success: false, message: 'Payroll record not found.' });
        }

        payroll.paidAmount += paidAmount;
        payroll.paymentDate = paymentDate || new Date();
        
        if (payroll.paidAmount >= payroll.netPayable) {
            payroll.status = 'paid';
        } else if (payroll.paidAmount > 0) {
            payroll.status = 'partially_paid';
        }

        // Optional: Create an expense in the Accounts system
        if (linkToAccounts) {
            const transaction = await Transaction.create([{
                item: `Salary Payment - ${payroll.user.fullName} (${payroll.month}/${payroll.year})`,
                type: 'expense',
                category: 'salary',
                amount: paidAmount,
                paymentMethod: 'bank_transfer',
                branch: payroll.user.branch || null,
                recordedBy: request.user._id,
                date: payroll.paymentDate
            }], { session });
            
            payroll.transaction = transaction[0]._id;
        }

        await payroll.save({ session });
        await session.commitTransaction();

        return reply.send({ success: true, message: 'Payment processed successfully.', data: payroll });
    } catch (error) {
        await session.abortTransaction();
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to process payment.' });
    } finally {
        session.endSession();
    }
};

// CSV Export/Import
export const exportPayroll = async (request, reply) => {
    try {
        const { month, year } = request.query;
        const records = await Payroll.find({ month, year }).populate('user').lean();

        const csvData = records.map(p => ({
            Employee: p.user?.fullName,
            Month: p.month,
            Year: p.year,
            'Basic Salary': p.basicSalary,
            'Allowances': p.totalAllowances,
            'Deductions': p.totalDeductions,
            'Attendance Deduction': p.attendanceDeduction,
            'Net Payable': p.netPayable,
            'Paid Amount': p.paidAmount,
            Status: p.status
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="payroll_${month}_${year}.csv"`);
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export payroll.' });
    }
};

export const importEmployeeData = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let processed = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['EmployeeID'] && row['Email']) {
                const user = await User.findOne({ email: row['Email'] });
                if (user) {
                    await EmployeeProfile.findOneAndUpdate(
                        { user: user._id },
                        {
                            employeeId: row['EmployeeID'],
                            designation: row['Designation'],
                            department: row['Department'],
                            joiningDate: row['JoiningDate'] ? new Date(row['JoiningDate']) : new Date()
                        },
                        { upsert: true }
                    );
                    processed++;
                }
            }
        }

        return reply.send({ success: true, message: `Processed ${processed} employee records.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import employees.' });
    }
};
