import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import School from '../models/School.js';
import Branch from '../models/Branch.js';
import Batch from '../models/Batch.js';
import connectDB from '../config/db.js';

const testTeachersAndSchools = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // 1. Setup Branch
        console.log('--- 1. Setting up Branch ---');
        let branch = await Branch.findOne({ name: 'Test Branch' });
        if (!branch) {
            branch = await Branch.create({ name: 'Test Branch', address: '123 Test St' });
        }
        console.log('Branch:', branch.name);

        // 2. Setup School
        console.log('--- 2. Setting up School under Branch ---');
        let school = await School.findOne({ nameEn: 'Test School' });
        if (school) await School.deleteOne({ _id: school._id });
        
        school = await School.create({
            nameEn: 'Test School',
            branch: branch._id,
            country: 'Japan'
        });
        console.log('School created:', school.nameEn, 'under branch:', branch.name);

        // 3. Setup Teacher
        console.log('--- 3. Setting up Teacher ---');
        const teacherEmail = 'teacher.test@example.com';
        await User.deleteOne({ email: teacherEmail });
        await EmployeeProfile.deleteMany({ employeeId: 'T1001' });

        const teacher = await User.create({
            fullName: 'John Teacher',
            email: teacherEmail,
            role: 'teacher',
            password: 'Password123!',
            branch: branch._id,
            school: school._id
        });
        
        await EmployeeProfile.create({
            user: teacher._id,
            employeeId: 'T1001',
            designation: 'Senior Sensei',
            department: 'Japanese',
            joiningDate: new Date()
        });
        console.log('Teacher created:', teacher.fullName, 'assigned to school:', school.nameEn);

        // 4. Setup Batch linked to Teacher and School
        console.log('--- 4. Setting up Batch ---');
        await Batch.deleteMany({ batchName: 'Test Batch' });
        const batch = await Batch.create({
            batchName: 'Test Batch',
            teacher: teacher._id,
            school: school._id,
            branch: branch._id,
            country: 'Japan',
            level: 'N5'
        });
        console.log('Batch created:', batch.batchName, 'linked to Teacher and School');

        // 5. Verify Links via populated query
        console.log('--- 5. Verifying Links ---');
        const populatedBatch = await Batch.findById(batch._id)
            .populate('teacher', 'fullName')
            .populate('school', 'nameEn')
            .populate('branch', 'name');
        
        console.log('Verification:');
        console.log(' - Batch:', populatedBatch.batchName);
        console.log(' - Teacher:', populatedBatch.teacher?.fullName);
        console.log(' - School:', populatedBatch.school?.nameEn);
        console.log(' - Branch:', populatedBatch.branch?.name);

        if (populatedBatch.school?._id.toString() === school._id.toString()) {
            console.log('\nSUCCESS: All school and teacher associations are working correctly.');
        } else {
            console.log('\nFAILURE: School association mismatch.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

testTeachersAndSchools();
