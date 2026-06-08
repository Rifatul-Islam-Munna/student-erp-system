import User from '../models/User.js';
import crypto from 'crypto';
import { sendMail } from '../services/mail.service.js';
import logger from '../services/logger.service.js';

// POST /auth/register
export const register = async (request, reply) => {
    try {
        const { fullName, email, password, phone, role } = request.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return reply.code(409).send({
                success: false,
                message: 'Email already registered'
            });
        }

        // Get default permissions for role
        const permissions = User.getDefaultPermissions(role || 'student');

        // Create user
        const user = await User.create({
            fullName,
            email,
            password,
            phone,
            role: role || 'student',
            permissions
        });

        // Generate JWT token
        const token = request.server.jwt.sign(
            { id: user._id, role: user.role },
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return reply.code(201).send({
            success: true,
            message: 'Registration successful',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        logger.error(error, 'Register error');
        return reply.code(500).send({
            success: false,
            message: 'Registration failed'
        });
    }
};

// POST /auth/login
export const login = async (request, reply) => {
    try {
        const { email, password } = request.body;

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return reply.code(401).send({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check account status
        if (user.accountStatus !== 'active') {
            return reply.code(403).send({
                success: false,
                message: `Account is ${user.accountStatus}. Please contact admin.`
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return reply.code(401).send({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLoginAt = new Date();
        user.lastLoginIp = request.headers['x-forwarded-for'] || request.ip || request.socket.remoteAddress;
        await user.save();

        // Generate JWT token
        const token = request.server.jwt.sign(
            { id: user._id, role: user.role },
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return reply.code(200).send({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        logger.error(error, 'Login error');
        return reply.code(500).send({
            success: false,
            message: 'Login failed'
        });
    }
};

// POST /auth/forgot-password
export const forgotPassword = async (request, reply) => {
    try {
        const { email } = request.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists
            return reply.code(200).send({
                success: true,
                message: 'If the email exists, a reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${resetToken}`;

        try {
            await sendMail({
                to: user.email,
                subject: 'AgencyBook - Password Reset',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user.fullName},</p>
                    <p>You requested a password reset. Click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
                    <p>This link will expire in 30 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });
        } catch (emailErr) {
            logger.error(emailErr, 'Failed to send reset email');
        }

        return reply.code(200).send({
            success: true,
            message: 'If the email exists, a reset link has been sent'
        });
    } catch (error) {
        logger.error(error, 'Forgot password error');
        return reply.code(500).send({
            success: false,
            message: 'Failed to process request'
        });
    }
};

// POST /auth/reset-password
export const resetPassword = async (request, reply) => {
    try {
        const { token, newPassword } = request.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return reply.code(400).send({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return reply.code(200).send({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        logger.error(error, 'Reset password error');
        return reply.code(500).send({
            success: false,
            message: 'Failed to reset password'
        });
    }
};

// GET /auth/me
export const getMe = async (request, reply) => {
    try {
        return reply.code(200).send({
            success: true,
            data: request.user.toJSON()
        });
    } catch (error) {
        logger.error(error, 'Get me error');
        return reply.code(500).send({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

// POST /auth/change-password
export const changePassword = async (request, reply) => {
    try {
        const { currentPassword, newPassword } = request.body;

        const user = await User.findById(request.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return reply.code(400).send({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        return reply.code(200).send({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        logger.error(error, 'Change password error');
        return reply.code(500).send({
            success: false,
            message: 'Failed to change password'
        });
    }
};
