import mongoose from 'mongoose';
import 'dotenv/config';
import Setting from '../models/Setting.js';
import FAQ from '../models/FAQ.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

const testFAQs = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // 1. Setup Settings
        console.log('--- 1. Setting up FAQ categories ---');
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({ site: { name: 'Test' } });
        }
        
        const faqCategories = ['Admission', 'Visa', 'General'];
        settings.faq_categories = faqCategories;
        await settings.save();
        console.log('FAQ Categories set:', faqCategories);

        // 2. Clear previous test FAQs
        await FAQ.deleteMany({ question: /Test FAQ/ });

        // 3. Get dependencies
        const user = await User.findOne();
        const branch = await Branch.findOne();
        
        if (!user) throw new Error('No user found to record FAQ');

        // 4. Create Global FAQ
        console.log('--- 2. Creating Global FAQ ---');
        const globalFAQ = await FAQ.create({
            question: 'Test FAQ - How to apply?',
            answer: 'Visit our portal and follow the steps.',
            category: 'Admission',
            recordedBy: user._id,
            branch: null
        });
        console.log('Global FAQ created:', globalFAQ.question);

        // 5. Create Branch FAQ
        if (branch) {
            console.log('--- 3. Creating Branch FAQ ---');
            const branchFAQ = await FAQ.create({
                question: 'Test FAQ - Local Office Hours?',
                answer: '9 AM to 6 PM.',
                category: 'General',
                recordedBy: user._id,
                branch: branch._id
            });
            console.log('Branch FAQ created:', branchFAQ.question, 'for:', branch.name);
        }

        // 6. Test Search
        console.log('--- 4. Testing Search logic ---');
        const searchResults = await FAQ.find({
            $or: [
                { question: { $regex: 'apply', $options: 'i' } },
                { answer: { $regex: 'apply', $options: 'i' } }
            ]
        });
        console.log(`Found ${searchResults.length} search results for "apply".`);

        // 7. Test Priority Sorting
        console.log('--- 5. Testing Priority Sorting ---');
        await FAQ.create({
            question: 'Test FAQ - High Priority',
            answer: 'Ranked high.',
            priority: 10,
            recordedBy: user._id
        });
        const sorted = await FAQ.find().sort({ priority: -1, createdAt: -1 });
        console.log('Top FAQ question:', sorted[0].question);

        console.log('\nAll FAQ API logic tests completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

testFAQs();
