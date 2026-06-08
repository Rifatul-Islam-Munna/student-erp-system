export const getPagination = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

export const generateId = (prefix = '', length = 6) => {
    const num = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    return prefix ? `${prefix}-${num}` : num;
};
