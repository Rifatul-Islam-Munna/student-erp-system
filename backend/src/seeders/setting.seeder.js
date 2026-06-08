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
            counselors: ['Admin', 'Manager'],
            visatypes: ['Study', 'Tourist', 'Work'],
            agents: ['Global Agency', 'Local Partner'],
            visiting_sources: ['Facebook', 'Referral', 'Walk-in'],
            edu_degrees: ['SSC', 'HSC', 'Bachelor', 'Masters'],
            exam_types: ['JLPT', 'NAT-TEST', 'IELTS'],
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
