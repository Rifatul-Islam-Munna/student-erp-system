export const swaggerConfig = {
    openapi: {
        info: {
            title: 'AgencyBook API',
            description: 'Backend API for AgencyBook - School/Agency Management System',
            version: '1.0.0',
            contact: {
                name: 'API Support',
                email: 'mhshakib6@gmail.com'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }],
        consumes: ['application/json', 'multipart/form-data'],
        produces: ['application/json', 'multipart/form-data'],
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management' },
            { name: 'Permissions', description: 'Permission management' },
            { name: 'Dashboard', description: 'System Analytics & Dashboard metrics' },
            { name: 'Visitors', description: 'Visitor/Lead tracking and management' },
            { name: 'Students', description: 'Student portal and enrollment management' },
            { name: 'Teachers', description: 'Teacher and instruction management' },
            { name: 'Branches', description: 'Branch management for different locations' },
            { name: 'Batches', description: 'Batch and Examination scheduling' },
            { name: 'Batch Enrolled', description: 'Student batch enrollments' },
            { name: 'Batch Exams', description: 'Batch examination schedules' },
            { name: 'Batch Exam Results', description: 'Batch examination grading and results' },
            { name: 'Events', description: 'System and calendar events' },
            { name: 'Events & Calendar', description: 'Events and calendar management' },
            { name: 'Tasks', description: 'Internal Task tracking and to-do lists' },
            { name: 'Partner Agencies', description: 'B2B Partner and Agency Configuration' },
            { name: 'Partner Agency', description: 'Partner Agencies management' },
            { name: 'Schools', description: 'School/University directory and assignments' },
            { name: 'School Submissions', description: 'Submissions and applications made to schools' },
            { name: 'Accounts', description: 'Financial income, expense, and tax management' },
            { name: 'Transactions', description: 'Ledger transaction logs' },
            { name: 'HR Payroll', description: 'Employee salary configuration' },
            { name: 'HR & Payroll', description: 'Human resources and payroll systems' },
            { name: 'Attendance', description: 'Employee and student attendance logs' },
            { name: 'Documents', description: 'Document configurations and templates' },
            { name: 'Inventory', description: 'Inventory and asset management' },
            { name: 'FAQs', description: 'Frequently Asked Questions repository' },
            { name: 'Messages', description: 'Email and SMS Messaging System automation' },
            { name: 'Communication Logs', description: 'History and logs of communications' },
            { name: 'Message Settings', description: 'Settings for automated messaging configurations' },
            { name: 'Settings', description: 'Global application variables and toggles' },
            { name: 'Audit Logs', description: 'Activity audit trail and compliance logging' },
            { name: 'Notifications', description: 'In-app notification system and preferences' },
            { name: 'Invoices', description: 'Invoice generation, payment tracking, and receipt system' },
            { name: 'Visa Applications', description: 'Visa application tracker with extended status pipeline' },
            { name: 'Targets & Goals', description: 'Sales targets, KPI tracking, and leaderboards' },
            { name: 'Workflow Engine', description: 'Automated workflow rules and trigger configuration' }
        ]
    },
    hideUntagged: false, // Changed to false to gracefully show endpoints missing strict tags during development
    exposeRoute: true
};

export const swaggerUiConfig = {
    routePrefix: '/documentation',
    uiConfig: {
        docExpansion: process.env.SWAGGER_DOC_EXPANSION || 'none',
        deepLinking: true,
        displayRequestDuration: true,
        filter: true
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
};
