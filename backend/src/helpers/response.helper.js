export const successResponse = (reply, data, message = 'Success', statusCode = 200) => {
    return reply.code(statusCode).send({
        success: true,
        message,
        data
    });
};

export const errorResponse = (reply, message = 'Something went wrong', statusCode = 500) => {
    return reply.code(statusCode).send({
        success: false,
        message
    });
};

export const paginatedResponse = (reply, data, total, page, limit, message = 'Success') => {
    return reply.code(200).send({
        success: true,
        message,
        data,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    });
};
