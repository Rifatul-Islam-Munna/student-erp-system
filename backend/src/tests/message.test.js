import { expect } from 'chai';
import { fastify } from '../app.js';
import User from '../models/User.js';
import MessageSetting from '../models/MessageSetting.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';

describe('Message System API', () => {
    let superAdminToken;
    let branchToken;
    let superAdminUser;
    let branchUser;

    before(async () => {
        await User.deleteMany({});
        await MessageSetting.deleteMany({});
        await Message.deleteMany({});

        // Create Super Admin
        const superAdminRes = await fastify.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                first_name: 'Super',
                last_name: 'Admin',
                email: 'superadmin_message@test.com',
                password: 'password123',
                role: 'super_admin'
            }
        });
        const saData = JSON.parse(superAdminRes.payload);
        superAdminToken = saData.data.token;
        superAdminUser = saData.data.user;

        // Create Branch User
        const branchRes = await fastify.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                first_name: 'Branch',
                last_name: 'User',
                email: 'branch_message@test.com',
                password: 'password123',
                role: 'branch',
                branch: new mongoose.Types.ObjectId()
            }
        });
        const bData = JSON.parse(branchRes.payload);
        branchToken = bData.data.token;
        branchUser = bData.data.user;
    });

    after(async () => {
        await User.deleteMany({ email: { $in: ['superadmin_message@test.com', 'branch_message@test.com'] } });
        await MessageSetting.deleteMany({});
        await Message.deleteMany({});
    });

    describe('Message Settings', () => {
        it('should get default message settings', async () => {
            const res = await fastify.inject({
                method: 'GET',
                url: '/api/v1/messages/settings',
                headers: { Authorization: `Bearer ${superAdminToken}` }
            });
            
            expect(res.statusCode).to.equal(200);
            const data = JSON.parse(res.payload);
            expect(data.success).to.be.true;
            expect(data.data.rolePermissions.super_admin.emailEnabled).to.be.true;
            expect(data.data.rolePermissions.branch.emailEnabled).to.be.false;
        });

        it('should update message settings (enable branch email)', async () => {
            const res = await fastify.inject({
                method: 'PUT',
                url: '/api/v1/messages/settings',
                headers: { Authorization: `Bearer ${superAdminToken}` },
                payload: {
                    rolePermissions: {
                        super_admin: { emailEnabled: true, smsEnabled: true },
                        admin: { emailEnabled: true, smsEnabled: true },
                        branch: { emailEnabled: true, smsEnabled: true } // Enabling here
                    },
                    emailGateways: [{
                        provider: 'SendGrid',
                        host: 'smtp.sendgrid.net',
                        port: 587,
                        user: 'apikey',
                        pass: 'testpass',
                        fromEmail: 'noreply@test.com',
                        isDefault: true
                    }],
                    smsGateways: []
                }
            });
            
            expect(res.statusCode).to.equal(200);
            const data = JSON.parse(res.payload);
            expect(data.success).to.be.true;
            expect(data.data.rolePermissions.branch.emailEnabled).to.be.true;
            expect(data.data.emailGateways).to.have.lengthOf(1);
        });
    });

    describe('Send Message Config Checks', () => {
        it('should block branch user from sending SMS (disabled by default config above)', async () => {
            // First we ensure Branch SMS is disabled
            await fastify.inject({
                method: 'PUT',
                url: '/api/v1/messages/settings',
                headers: { Authorization: `Bearer ${superAdminToken}` },
                payload: {
                    rolePermissions: {
                        super_admin: { emailEnabled: true, smsEnabled: true },
                        admin: { emailEnabled: true, smsEnabled: true },
                        branch: { emailEnabled: true, smsEnabled: false } // Force disable
                    }
                }
            });

            const res = await fastify.inject({
                method: 'POST',
                url: '/api/v1/messages',
                headers: { Authorization: `Bearer ${branchToken}` },
                payload: {
                    messageType: 'sms',
                    recipientPhone: '+1234567890',
                    content: 'Hello World'
                }
            });

            expect(res.statusCode).to.equal(403);
            const data = JSON.parse(res.payload);
            expect(data.message).to.include('SMS sending is currently disabled');
        });

        it('should allow Super Admin to send an email', async () => {
            const res = await fastify.inject({
                method: 'POST',
                url: '/api/v1/messages',
                headers: { Authorization: `Bearer ${superAdminToken}` },
                payload: {
                    messageType: 'email',
                    recipientEmail: 'test@example.com',
                    subject: 'Test Subject',
                    content: 'Hello from API block'
                }
            });

            expect(res.statusCode).to.equal(201);
            const data = JSON.parse(res.payload);
            expect(data.success).to.be.true;
            expect(data.data.status).to.equal('sent');
            expect(data.data.gatewayUsed).to.equal('SendGrid'); // Inherited from earlier config mapping
        });
    });

    describe('List and Manage Messages', () => {
        it('should list messages with pagination and filtering', async () => {
            const res = await fastify.inject({
                method: 'GET',
                url: '/api/v1/messages?messageType=email&limit=5',
                headers: { Authorization: `Bearer ${superAdminToken}` }
            });

            expect(res.statusCode).to.equal(200);
            const data = JSON.parse(res.payload);
            expect(data.success).to.be.true;
            expect(data.data.docs).to.be.an('array');
            expect(data.data.docs.length).to.be.at.least(1);
        });

        it('should export messages to CSV', async () => {
            const res = await fastify.inject({
                method: 'GET',
                url: '/api/v1/messages/export',
                headers: { Authorization: `Bearer ${superAdminToken}` }
            });

            expect(res.statusCode).to.equal(200);
            expect(res.headers['content-type']).to.include('text/csv');
            expect(res.payload).to.include('messageType');
            expect(res.payload).to.include('email');
        });
    });
});
