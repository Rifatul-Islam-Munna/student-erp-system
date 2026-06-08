import 'dotenv/config';
import { fastify } from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Comprehensive API Test Suite for ALL new features:
 * 1. Advanced Dashboard (7 endpoints)
 * 2. Audit Logs (6 endpoints)
 * 3. Notifications (10 endpoints)
 * 4. Invoices (9 endpoints)
 * 5. Visa Applications (9 endpoints)
 * 6. Targets & Goals (9 endpoints)
 * 7. Workflow Rules (8 endpoints)
 * 8. Lead Scoring (4 endpoints on /visitors)
 * 9. Pipeline/Kanban (2 endpoints on /school-submissions)
 */

let token;
let testUserId;
const results = { passed: 0, failed: 0, errors: [] };

const test = async (name, fn) => {
    try {
        await fn();
        results.passed++;
        console.log(`  ✅ ${name}`);
    } catch (error) {
        results.failed++;
        results.errors.push({ name, error: error.message });
        console.log(`  ❌ ${name} — ${error.message}`);
    }
};

const inject = async (method, url, payload = null) => {
    const opts = {
        method,
        url: `/api/v1${url}`,
        headers: { authorization: `Bearer ${token}` },
    };
    if (payload) opts.payload = payload;
    return fastify.inject(opts);
};

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

async function runTests() {
    try {
        console.log('\n🚀 Starting Comprehensive Feature Tests...\n');
        await fastify.ready();

        // Create test super_admin
        const testUser = await User.findOneAndUpdate(
            { email: 'test_features@agencybook.com' },
            {
                fullName: 'Feature Test Admin',
                email: 'test_features@agencybook.com',
                password: 'TestPass123!',
                role: 'super_admin',
                accountStatus: 'active',
                permissions: User.getDefaultPermissions('super_admin')
            },
            { upsert: true, new: true }
        );
        testUserId = testUser._id;
        token = fastify.jwt.sign({ id: testUser._id, role: testUser.role });

        // ================================================
        // 1. DASHBOARD
        // ================================================
        console.log('\n📊 1. ADVANCED DASHBOARD');

        await test('GET /dashboard/summary', async () => {
            const res = await inject('GET', '/dashboard/summary');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const data = JSON.parse(res.payload);
            assert(data.success === true, 'Expected success');
            assert(Array.isArray(data.data), 'Expected data array');
        });

        await test('GET /dashboard/revenue-trend', async () => {
            const res = await inject('GET', '/dashboard/revenue-trend?period=monthly');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /dashboard/conversion-funnel', async () => {
            const res = await inject('GET', '/dashboard/conversion-funnel');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /dashboard/agent-scorecards', async () => {
            const res = await inject('GET', '/dashboard/agent-scorecards');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /dashboard/branch-comparison', async () => {
            const res = await inject('GET', '/dashboard/branch-comparison');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /dashboard/intake-forecast', async () => {
            const res = await inject('GET', '/dashboard/intake-forecast');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /dashboard/top-schools', async () => {
            const res = await inject('GET', '/dashboard/top-schools?limit=5');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        // ================================================
        // 2. AUDIT LOGS
        // ================================================
        console.log('\n📋 2. AUDIT LOGS');

        await test('GET /audit-logs', async () => {
            const res = await inject('GET', '/audit-logs');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const data = JSON.parse(res.payload);
            assert(data.pagination !== undefined, 'Expected pagination');
        });

        await test('GET /audit-logs/stats', async () => {
            const res = await inject('GET', '/audit-logs/stats');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /audit-logs/export', async () => {
            const res = await inject('GET', '/audit-logs/export');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /audit-logs with filters', async () => {
            const res = await inject('GET', '/audit-logs?action=create&page=1&limit=5');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        // ================================================
        // 3. NOTIFICATIONS
        // ================================================
        console.log('\n🔔 3. NOTIFICATIONS');

        await test('GET /notifications', async () => {
            const res = await inject('GET', '/notifications');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /notifications/unread-count', async () => {
            const res = await inject('GET', '/notifications/unread-count');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const data = JSON.parse(res.payload);
            assert(data.data.unreadCount !== undefined, 'Expected unreadCount');
        });

        let notificationId;
        await test('POST /notifications/send', async () => {
            const res = await inject('POST', '/notifications/send', {
                recipients: [testUserId.toString()],
                title: 'Test Notification',
                body: 'This is a test notification from the API test suite.',
                type: 'system',
                priority: 'high'
            });
            assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.payload}`);
        });

        await test('GET /notifications (after send)', async () => {
            const res = await inject('GET', '/notifications');
            const data = JSON.parse(res.payload);
            assert(data.data.length > 0, 'Expected at least 1 notification');
            notificationId = data.data[0]._id;
        });

        await test('PATCH /notifications/:id/read', async () => {
            if (!notificationId) throw new Error('No notification to mark as read');
            const res = await inject('PATCH', `/notifications/${notificationId}/read`);
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('PATCH /notifications/mark-all-read', async () => {
            const res = await inject('PATCH', '/notifications/mark-all-read');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('POST /notifications/broadcast', async () => {
            const res = await inject('POST', '/notifications/broadcast', {
                title: 'Test Broadcast',
                body: 'Broadcast test from API suite.',
                roles: ['super_admin']
            });
            assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.payload}`);
        });

        await test('GET /notifications/preferences', async () => {
            const res = await inject('GET', '/notifications/preferences');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('PUT /notifications/preferences', async () => {
            const res = await inject('PUT', '/notifications/preferences', {
                emailDigest: 'daily',
                playSound: false
            });
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        // ================================================
        // 4. INVOICES
        // ================================================
        console.log('\n🧾 4. INVOICES');

        // Need a branch for invoices — use the user's branch or create minimal
        const Branch = (await import('../models/Branch.js')).default;
        let testBranch = await Branch.findOne();
        if (!testBranch) {
            testBranch = await Branch.create({ name: 'Test Branch', location: 'Test City' });
        }

        let invoiceId;
        await test('POST /invoices', async () => {
            const res = await inject('POST', '/invoices', {
                recipientName: 'Test Student',
                recipientEmail: 'student@test.com',
                items: [
                    { description: 'Tuition Fee', quantity: 1, unitPrice: 50000 },
                    { description: 'Admission Fee', quantity: 1, unitPrice: 10000 }
                ],
                taxRate: 5,
                discount: 2000,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                branch: testBranch._id.toString()
            });
            assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.payload}`);
            const data = JSON.parse(res.payload);
            invoiceId = data.data._id;
            assert(data.data.invoiceNumber, 'Expected invoice number');
            assert(data.data.totalAmount > 0, 'Expected positive total');
        });

        await test('GET /invoices', async () => {
            const res = await inject('GET', '/invoices');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const data = JSON.parse(res.payload);
            assert(data.pagination, 'Expected pagination');
        });

        await test('GET /invoices/:id', async () => {
            const res = await inject('GET', `/invoices/${invoiceId}`);
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('PUT /invoices/:id', async () => {
            const res = await inject('PUT', `/invoices/${invoiceId}`, {
                notes: 'Updated during testing',
                status: 'sent'
            });
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('POST /invoices/:id/record-payment', async () => {
            const res = await inject('POST', `/invoices/${invoiceId}/record-payment`, {
                amount: 25000,
                paymentMethod: 'bkash',
                reference: 'TRX-TEST-001'
            });
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /invoices/stats', async () => {
            const res = await inject('GET', '/invoices/stats');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /invoices/export', async () => {
            const res = await inject('GET', '/invoices/export');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        // ================================================
        // 5. VISA APPLICATIONS
        // ================================================
        console.log('\n📈 5. VISA APPLICATIONS');

        // Create a test student
        const Student = (await import('../models/Student.js')).default;
        let testStudent = await Student.findOne();
        if (!testStudent) {
            testStudent = await Student.create({
                fullNameEn: 'Test Student',
                phone: '01700000000',
                email: `test_student_${Date.now()}@test.com`,
                dob: new Date('2000-01-01'),
                gender: 'male',
                branch: testBranch._id
            });
        }

        let visaAppId;
        await test('POST /visa-applications', async () => {
            const res = await inject('POST', '/visa-applications', {
                student: testStudent._id.toString(),
                visaType: 'Student Visa',
                country: 'Japan',
                status: 'Document Collection',
                checklist: [
                    { item: 'Passport copy', isCompleted: false },
                    { item: 'Photo', isCompleted: true },
                    { item: 'Academic certificates', isCompleted: false }
                ],
                embassyAppointment: {
                    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    location: 'Dhaka Embassy'
                },
                visaFee: 3000,
                passportNumber: 'AB1234567',
                branch: testBranch._id.toString()
            });
            assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.payload}`);
            const data = JSON.parse(res.payload);
            visaAppId = data.data._id;
        });

        await test('GET /visa-applications', async () => {
            const res = await inject('GET', '/visa-applications');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /visa-applications/:id', async () => {
            const res = await inject('GET', `/visa-applications/${visaAppId}`);
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const data = JSON.parse(res.payload);
            assert(data.data.statusHistory.length >= 1, 'Expected status history');
            assert(data.data.checklist.length === 3, 'Expected 3 checklist items');
        });

        await test('PUT /visa-applications/:id (status change)', async () => {
            const res = await inject('PUT', `/visa-applications/${visaAppId}`, {
                status: 'Embassy Submission',
                statusNote: 'Documents submitted to embassy'
            });
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /visa-applications/pipeline', async () => {
            const res = await inject('GET', '/visa-applications/pipeline');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /visa-applications/export', async () => {
            const res = await inject('GET', '/visa-applications/export');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /visa-applications with filters', async () => {
            const res = await inject('GET', '/visa-applications?country=Japan&status=Embassy Submission');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        // ================================================
        // 6. TARGETS & GOALS
        // ================================================
        console.log('\n🎯 6. TARGETS & GOALS');

        let targetId;
        await test('POST /targets', async () => {
            const res = await inject('POST', '/targets', {
                title: 'Q1 Student Enrollment Target',
                description: 'Enroll 50 students in Q1',
                metric: 'students_enrolled',
                targetValue: 50,
                period: 'quarterly',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                assignedTo: testUserId.toString(),
                branch: testBranch._id.toString(),
                incentive: {
                    type: 'bonus',
                    amount: 10000,
                    description: 'Quarterly bonus for target achievement'
                }
            });
            assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.payload}`);
            const data = JSON.parse(res.payload);
            targetId = data.data._id;
        });

        await test('GET /targets', async () => {
            const res = await inject('GET', '/targets');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /targets/:id', async () => {
            const res = await inject('GET', `/targets/${targetId}`);
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('PUT /targets/:id', async () => {
            const res = await inject('PUT', `/targets/${targetId}`, {
                currentValue: 15,
                description: 'Updated progress'
            });
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const data = JSON.parse(res.payload);
            assert(data.data.achievementPercentage === 30, `Expected 30% achievement, got ${data.data.achievementPercentage}`);
        });

        await test('POST /targets/:id/refresh', async () => {
            const res = await inject('POST', `/targets/${targetId}/refresh`);
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /targets/leaderboard', async () => {
            const res = await inject('GET', '/targets/leaderboard');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /targets/export', async () => {
            const res = await inject('GET', '/targets/export');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        // ================================================
        // 7. WORKFLOW ENGINE
        // ================================================
        console.log('\n🤖 7. WORKFLOW ENGINE');

        let workflowId;
        await test('POST /workflow-rules', async () => {
            const res = await inject('POST', '/workflow-rules', {
                name: 'Auto-assign counselor on visitor creation',
                description: 'Round-robin counselor assignment for new visitors',
                triggerEvent: 'visitor_created',
                conditions: [
                    { field: 'preferredCountry', operator: 'contains', value: 'Japan' }
                ],
                actions: [
                    { type: 'assign_user', config: { role: 'counselor' } },
                    { type: 'send_notification', config: { title: 'New visitor assigned', body: 'A new visitor has been assigned to you' } }
                ],
                assignmentStrategy: 'round_robin',
                isActive: true
            });
            assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.payload}`);
            const data = JSON.parse(res.payload);
            workflowId = data.data._id;
        });

        await test('GET /workflow-rules', async () => {
            const res = await inject('GET', '/workflow-rules');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('GET /workflow-rules/:id', async () => {
            const res = await inject('GET', `/workflow-rules/${workflowId}`);
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('PUT /workflow-rules/:id', async () => {
            const res = await inject('PUT', `/workflow-rules/${workflowId}`, {
                description: 'Updated description for testing'
            });
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('PATCH /workflow-rules/:id/toggle', async () => {
            const res = await inject('PATCH', `/workflow-rules/${workflowId}/toggle`);
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const data = JSON.parse(res.payload);
            assert(data.data.isActive === false, 'Expected toggled to inactive');
        });

        await test('GET /workflow-rules/export', async () => {
            const res = await inject('GET', '/workflow-rules/export');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        // ================================================
        // 8. LEAD SCORING (on /visitors)
        // ================================================
        console.log('\n🔄 8. LEAD SCORING');

        await test('GET /visitors/lead-overview', async () => {
            const res = await inject('GET', '/visitors/lead-overview');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        await test('POST /visitors/bulk-score', async () => {
            const res = await inject('POST', '/visitors/bulk-score');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        });

        // ================================================
        // 9. PIPELINE / KANBAN (on /school-submissions)
        // ================================================
        console.log('\n🗂️ 9. APPLICATION PIPELINE');

        await test('GET /school-submissions/pipeline', async () => {
            const res = await inject('GET', '/school-submissions/pipeline');
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const data = JSON.parse(res.payload);
            assert(Array.isArray(data.data), 'Expected array of pipeline stages');
        });

        // ================================================
        // CLEANUP
        // ================================================
        console.log('\n🧹 Cleaning up test data...');

        const Invoice = (await import('../models/Invoice.js')).default;
        const VisaApplication = (await import('../models/VisaApplication.js')).default;
        const Target = (await import('../models/Target.js')).default;
        const WorkflowRule = (await import('../models/WorkflowRule.js')).default;
        const Notification = (await import('../models/Notification.js')).default;
        const NotificationPreference = (await import('../models/NotificationPreference.js')).default;

        // Delete created test items
        if (invoiceId) await Invoice.findByIdAndDelete(invoiceId);
        if (visaAppId) await VisaApplication.findByIdAndDelete(visaAppId);
        if (targetId) await Target.findByIdAndDelete(targetId);
        if (workflowId) await WorkflowRule.findByIdAndDelete(workflowId);
        await Notification.deleteMany({ recipient: testUserId });
        await NotificationPreference.deleteMany({ user: testUserId });
        await User.findByIdAndDelete(testUserId);

        // ================================================
        // RESULTS
        // ================================================
        console.log('\n' + '='.repeat(50));
        console.log(`📊 TEST RESULTS: ${results.passed} passed, ${results.failed} failed out of ${results.passed + results.failed} total`);
        console.log('='.repeat(50));

        if (results.errors.length > 0) {
            console.log('\n❌ Failed tests:');
            results.errors.forEach((e, i) => console.log(`  ${i + 1}. ${e.name}: ${e.error}`));
        }

        console.log('\n');
        process.exit(results.failed > 0 ? 1 : 0);

    } catch (error) {
        console.error('\n💥 FATAL TEST ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

runTests();
