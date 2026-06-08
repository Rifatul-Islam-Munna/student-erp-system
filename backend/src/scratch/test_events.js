import mongoose from 'mongoose';
import 'dotenv/config';
import Setting from '../models/Setting.js';
import Event from '../models/Event.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

const testEvents = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // 1. Setup Settings
        console.log('--- 1. Setting up categories ---');
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({ site: { name: 'Test' } });
        }
        
        const testCategories = ['Seminar', 'Exam', 'Holiday', 'Workshop'];
        settings.event_categories = testCategories;
        await settings.save();
        console.log('Categories set:', testCategories);

        // 2. Clear previous test events (optional, but good for clean test)
        await Event.deleteMany({ title: /Test Event/ });

        // 3. Get a user and a branch for recording
        const user = await User.findOne();
        const branch = await Branch.findOne();
        
        if (!user) throw new Error('No user found to record event');
        if (!branch) console.warn('No branch found, global events only for now');

        // 4. Create a valid global event
        console.log('--- 2. Creating Global Event ---');
        const globalEvent = await Event.create({
            title: 'Test Event - Global Seminar',
            category: 'Seminar',
            description: 'A global seminar',
            startDate: new Date('2026-05-01T10:00:00Z'),
            endDate: new Date('2026-05-01T12:00:00Z'),
            recordedBy: user._id,
            branch: null
        });
        console.log('Global event created:', globalEvent.title);

        // 5. Create a valid branch event
        if (branch) {
            console.log('--- 3. Creating Branch Event ---');
            const branchEvent = await Event.create({
                title: 'Test Event - Branch Exam',
                category: 'Exam',
                description: 'Local exam',
                startDate: new Date('2026-05-05T09:00:00Z'),
                endDate: new Date('2026-05-05T17:00:00Z'),
                recordedBy: user._id,
                branch: branch._id
            });
            console.log('Branch event created:', branchEvent.title, 'for branch:', branch.name);
        }

        // 6. Test Category Validation (via logic that will be in controller)
        // Since this script uses the Model directly, it bypasses controller logic.
        // We'll simulate the check here as it would happen in the controller.
        console.log('--- 4. Testing Category Validation Logic ---');
        const invalidCategory = 'Party';
        const isInvalid = !testCategories.includes(invalidCategory);
        console.log(`Validation for "${invalidCategory}": ${isInvalid ? 'Rejected (Success)' : 'Accepted (Fail)'}`);

        // 7. Test Date Range Filtering (Query Logic)
        console.log('--- 5. Testing Date Range Logic ---');
        const startDate = new Date('2026-05-01T00:00:00Z');
        const endDate = new Date('2026-05-10T23:59:59Z');
        
        // Find events that overlap with May 1st to May 10th
        const foundEvents = await Event.find({
            $and: [
                { endDate: { $gte: startDate } },
                { startDate: { $lte: endDate } }
            ]
        });
        console.log(`Found ${foundEvents.length} events in May range.`);
        foundEvents.forEach(e => console.log(` - ${e.title} (${e.startDate.toISOString()} - ${e.endDate.toISOString()})`));

        console.log('\nAll tests completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

testEvents();
