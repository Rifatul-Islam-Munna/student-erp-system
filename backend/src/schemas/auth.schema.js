// Swagger schema definitions for auth routes

export const registerSwagger = {
    tags: ['Auth'],
    description: 'Register a new user account',
    body: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
            fullName: { type: 'string', description: 'Full name of the user' },
            email: { type: 'string', format: 'email', description: 'User email address' },
            password: { type: 'string', description: 'User password (min 6 chars)' },
            phone: { type: 'string', description: 'Phone number (optional)' },
            role: { type: 'string', enum: ['student', 'admin', 'branch'], description: 'User role' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        user: { type: 'object', 
                            properties: {
                                id: { type: 'string' },
                                fullName: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string' }
                            }
                        },
                        token: { type: 'string' }
                    }
                }
            }
        }
    }
};

export const loginSwagger = {
    tags: ['Auth'],
    description: 'Login with email and password',
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email', description: 'User email address' },
            password: { type: 'string', description: 'User password' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        user: { type: 'object', 
                            properties: {
                                id: { type: 'string' },
                                fullName: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string' }
                            } 
                        },
                        token: { type: 'string' }
                    }
                }
            }
        }
    }
};

export const forgotPasswordSwagger = {
    tags: ['Auth'],
    description: 'Send password reset email',
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email', description: 'User email address' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

export const resetPasswordSwagger = {
    tags: ['Auth'],
    description: 'Reset password using token',
    body: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
            token: { type: 'string', description: 'Password reset token' },
            newPassword: { type: 'string', description: 'New password (min 6 chars)' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

export const getMeSwagger = {
    tags: ['Auth'],
    description: 'Get current user profile',
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' }
            }
        }
    }
};

export const changePasswordSwagger = {
    tags: ['Auth'],
    description: 'Change password (authenticated)',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};
