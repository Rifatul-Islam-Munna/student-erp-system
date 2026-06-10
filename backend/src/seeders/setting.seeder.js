import Setting from '../models/Setting.js';
import logger from '../services/logger.service.js';

const settingSeeder = async () => {
    try {
        const settingExists = await Setting.findOne();
        if (settingExists) return;

        await Setting.create({
            site: {
                name: 'AgencyBook',
                maintenance_mode: false,
                academic_year: '2025-2026'
            },
            visatypes: [
                { name: 'Study', slug: 'study' },
                { name: 'Tourist', slug: 'tourist' },
                { name: 'Work', slug: 'work' }
            ],
            visiting_sources: ['Facebook', 'Referral', 'Walk-in'],
            edu_degrees: ['SSC', 'HSC', 'Bachelor', 'Masters'],
            exam_types: [
                { name: 'JLPT', slug: 'jlpt' },
                { name: 'NAT-TEST', slug: 'nat-test' },
                { name: 'IELTS', slug: 'ielts' }
            ],
            countries: [
                { name: 'Japan', logoUrl: 'https://flagcdn.com/jp.svg' },
                { name: 'South Korea', logoUrl: 'https://flagcdn.com/kr.svg' }
            ],
            event_categories: ['Seminar', 'Holiday', 'Meeting', 'Deadline', 'Exam', 'Orientation'],
            faq_categories: ['Admission', 'Visa', 'Documentation', 'Fees', 'General']
        });

        logger.info('Default settings created');
    } catch (error) {
        logger.error(error, 'Setting seeder error');
    }
};

export default settingSeeder;
