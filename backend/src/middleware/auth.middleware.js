import User from '../models/User.js';

export const authenticate = async (request, reply) => {
    try {
        await request.jwtVerify();
        
        const user = await User.findById(request.user.id);
        if (!user) {
            return reply.code(401).send({ success: false, message: 'User not found' });
        }

        if (user.accountStatus !== 'active') {
            return reply.code(403).send({ success: false, message: 'Account suspended or inactive' });
        }

        request.user = user;
    } catch (err) {
        return reply.code(401).send({ success: false, message: 'Unauthorized, token failed' });
    }
};

export const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return async (request, reply) => {
        if (!request.user) {
            return reply.code(401).send({ success: false, message: 'Not authenticated' });
        }

        if (roles.length && !roles.includes(request.user.role)) {
            return reply.code(403).send({ success: false, message: `Role ${request.user.role} is not authorized to access this route` });
        }
    };
};

export const requirePermission = (permission) => {
    return async (request, reply) => {
        if (!request.user) {
            return reply.code(401).send({ success: false, message: 'Not authenticated' });
        }

        if (request.user.role === 'super_admin') return;

        if (!request.user.permissions?.includes(permission)) {
            return reply.code(403).send({ success: false, message: `Permission ${permission} is required to access this route` });
        }
    };
};
