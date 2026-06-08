import 'dotenv/config';
import { fastify } from '../app.js';
import mongoose from 'mongoose';
import Visitor from '../models/Visitor.js';
import Student from '../models/Student.js';
import Transaction from '../models/Transaction.js';
import PartnerAgency from '../models/PartnerAgency.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

async function runIntegrationTests() {
    try {
        console.log('Starting B2B Integration Tests...');

        // Connect to DB if needed
        if (mongoose.connection.readyState === 0) {
            await connectDB();
        }

        // Wait for fastify to be ready
        await fastify.ready();

        // 1. Setup Test Data
        const testAdmin = await User.findOneAndUpdate(
            { email: 'integration_admin@agencybook.com' },
            {
                fullName: 'Integration Admin',
                email: 'integration_admin@agencybook.com',
                password: 'Password123!',
                role: 'super_admin',
                accountStatus: 'active'
            },
            { upsert: true, new: true }
        );

        const testAgency = await PartnerAgency.create({
            agencyName: 'Integration Agency ' + Date.now(),
            ownerName: 'Agency Owner',
            email: `agency_int_${Date.now()}@test.com`,
            phone: '0987654321',
            type: 'agent'
        });

        const token = fastify.jwt.sign({ id: testAdmin._id, role: testAdmin.role });

        // 2. Test Linking Visitor
        console.log('Testing: Linking Visitor to Partner Agency');
        const visitorRes = await fastify.inject({
            method: 'POST',
            url: '/api/v1/visitors',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                fullName: 'Visitor Test',
                dateOfBirth: '2000-01-01',
                email: `visitor_${Date.now()}@test.com`,
                phone: '1112223333',
                gender: 'male',
                partnerAgency: testAgency._id
            }
        });
        if (visitorRes.statusCode !== 201) throw new Error('Visitor link failed');
        console.log('Visitor linked OK');

        // 3. Test Linking Student
        console.log('Testing: Linking Student to Partner Agency');
        const studentRes = await fastify.inject({
            method: 'POST',
            url: '/api/v1/students',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                fullNameEn: 'Student Test',
                email: `student_${Date.now()}@test.com`,
                phone: '4445556666',
                dob: '2000-01-01T00:00:00Z',
                gender: 'female',
                partnerAgency: testAgency._id
            }
        });
        if (studentRes.statusCode !== 201) throw new Error('Student link failed');
        console.log('Student linked OK');

        // 4. Test Linking Transaction
        console.log('Testing: Linking Transaction to Partner Agency');
        const transactionRes = await fastify.inject({
            method: 'POST',
            url: '/api/v1/accounts',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                item: 'Tuition Fee Payment',
                type: 'income',
                category: 'tuition_fee',
                amount: 5000,
                paymentMethod: 'cash',
                branch: new mongoose.Types.ObjectId(), // dummy branch
                partnerAgency: testAgency._id
            }
        });
        if (transactionRes.statusCode !== 201) throw new Error('Transaction link failed');
        console.log('Transaction linked OK');

        // 5. Test Performance Report
        console.log('Testing: GET /api/v1/reports/agencies/performance');
        const reportRes = await fastify.inject({
            method: 'GET',
            url: `/api/v1/reports/agencies/performance?agencyId=${testAgency._id}`,
            headers: { authorization: `Bearer ${token}` }
        });
        console.log('Status:', reportRes.statusCode);
        const reportData = JSON.parse(reportRes.payload);
        if (reportRes.statusCode !== 200) throw new Error('Performance report failed');
        
        const agencyPerf = reportData.data[0];
        console.log('Metrics:', agencyPerf.metrics);
        if (agencyPerf.metrics.totalVisitors !== 1 || agencyPerf.metrics.totalStudents !== 1) {
            throw new Error('Metrics counts are incorrect');
        }
        console.log('Report OK');

        console.log('B2B Integration Tests passed successfully!');

        // Cleanup
        await Visitor.deleteMany({ partnerAgency: testAgency._id });
        await Student.deleteMany({ partnerAgency: testAgency._id });
        await Transaction.deleteMany({ partnerAgency: testAgency._id });
        await PartnerAgency.findByIdAndDelete(testAgency._id);
        await User.findByIdAndDelete(testAdmin._id);

        process.exit(0);
    } catch (error) {
        console.error('Integration Test Result: FAILED');
        console.error(error);
        process.exit(1);
    }
}

runIntegrationTests();
