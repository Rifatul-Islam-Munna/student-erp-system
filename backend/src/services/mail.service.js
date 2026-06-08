import nodemailer from 'nodemailer';
import logger from './logger.service.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendMail = async ({ to, subject, html, text }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
            text
        });
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(error, 'Failed to send email');
        throw error;
    }
};

export default transporter;
