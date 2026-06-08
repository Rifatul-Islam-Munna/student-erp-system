import 'dotenv/config';
import { fastify } from '../app.js';
import mongoose from 'mongoose';
import PartnerAgency from '../models/PartnerAgency.js';
import User from '../models/User.js';

async function runTests() {
    try {
        console.log('Starting Partner Agency API tests...');

        // Wait for fastify to be ready
        await fastify.ready();

        // 1. Create a test super_admin user
        const testUser = await User.findOneAndUpdate(
            { email: 'test_admin@agencybook.com' },
            {
                fullName: 'Test Admin',
                email: 'test_admin@agencybook.com',
                password: 'Password123!',
                role: 'super_admin',
                accountStatus: 'active'
            },
            { upsert: true, new: true }
        );

        // Generate token
        const token = fastify.jwt.sign({ id: testUser._id, role: testUser.role });

        let agencyId;

        // 2. Test Create Agency
        console.log('Testing: POST /api/v1/partner-agencies');
        const createRes = await fastify.inject({
            method: 'POST',
            url: '/api/v1/partner-agencies',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                agencyName: 'Test Agency ' + Date.now(),
                ownerName: 'John Doe',
                email: `agency_${Date.now()}@test.com`,
                phone: '1234567890',
                type: 'agent',
                commissionRate: 10
            }
        });
        console.log('Status:', createRes.statusCode);
        const createData = JSON.parse(createRes.payload);
        if (createRes.statusCode !== 201) throw new Error('Create agency failed: ' + createRes.payload);
        agencyId = createData.data._id;
        console.log('OK');

        // 3. Test Get All Agencies (with filter)
        console.log('Testing: GET /api/v1/partner-agencies');
        const getRes = await fastify.inject({
            method: 'GET',
            url: '/api/v1/partner-agencies?type=agent',
            headers: { authorization: `Bearer ${token}` }
        });
        console.log('Status:', getRes.statusCode);
        if (getRes.statusCode !== 200) throw new Error('Get agencies failed');
        console.log('OK');

        // 4. Test Update Agency
        console.log(`Testing: PUT /api/v1/partner-agencies/${agencyId}`);
        const updateRes = await fastify.inject({
            method: 'PUT',
            url: `/api/v1/partner-agencies/${agencyId}`,
            headers: { authorization: `Bearer ${token}` },
            payload: {
                ownerName: 'John Updated'
            }
        });
        console.log('Status:', updateRes.statusCode);
        if (updateRes.statusCode !== 200) throw new Error('Update agency failed');
        console.log('OK');

        // 5. Test Get Agency By ID
        console.log(`Testing: GET /api/v1/partner-agencies/${agencyId}`);
        const getOneRes = await fastify.inject({
            method: 'GET',
            url: `/api/v1/partner-agencies/${agencyId}`,
            headers: { authorization: `Bearer ${token}` }
        });
        console.log('Status:', getOneRes.statusCode);
        if (getOneRes.statusCode !== 200) throw new Error('Get agency by id failed');
        console.log('OK');

        // 6. Test Export
        console.log('Testing: GET /api/v1/partner-agencies/export');
        const exportRes = await fastify.inject({
            method: 'GET',
            url: '/api/v1/partner-agencies/export',
            headers: { authorization: `Bearer ${token}` }
        });
        console.log('Status:', exportRes.statusCode);
        if (exportRes.statusCode !== 200) throw new Error('Export failed');
        console.log('OK');

        // 7. Test Delete
        console.log(`Testing: DELETE /api/v1/partner-agencies/${agencyId}`);
        const deleteRes = await fastify.inject({
            method: 'DELETE',
            url: `/api/v1/partner-agencies/${agencyId}`,
            headers: { authorization: `Bearer ${token}` }
        });
        console.log('Status:', deleteRes.statusCode);
        if (deleteRes.statusCode !== 200) throw new Error('Delete agency failed');
        console.log('OK');

        console.log('All tests passed successfully!');
        
        // Cleanup
        await User.findByIdAndDelete(testUser._id);
        
        process.exit(0);
    } catch (error) {
        console.error('Test Result: FAILED');
        console.error(error);
        process.exit(1);
    }
}

runTests();
