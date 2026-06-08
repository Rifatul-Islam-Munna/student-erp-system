const validate = (schema, property = 'body') => {
    return async (request, reply) => {
        const { error, value } = schema.validate(request[property]);
        if (error) {
            return reply.code(400).send({ message: error.details[0].message });
        }
        request[property] = value;
    };
};

export default validate;
