import User from '../models/User.js';
import logger from '../services/logger.service.js';

const adminSeeder = async () => {
    try {
        const adminExists = await User.findOne({ role: 'super_admin' });
        if (adminExists) return;

        const permissions = User.getDefaultPermissions('super_admin');

        await User.create({
            fullName: process.env.ADMIN_NAME || 'Super Admin',
            email: process.env.ADMIN_EMAIL || 'admin@agencybook.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123',
            role: 'super_admin',
            permissions,
            accountStatus: 'active'
        });

        logger.info('Default super admin user created');
    } catch (error) {
        logger.error(error, 'Admin seeder error');
    }
};

export default adminSeeder;
