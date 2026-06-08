import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import InventoryItem from '../models/InventoryItem.js';
import InventoryLog from '../models/InventoryLog.js';
import logger from '../services/logger.service.js';

export const getAllItems = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search, category, branch, lowStock } = request.query;
        const query = {};

        if (request.user.role === 'branch' && request.user.branch) {
            query.branch = request.user.branch;
        } else if (branch) {
            query.branch = branch;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) query.category = category;

        if (lowStock === 'true' || lowStock === true) {
            // quantity <= minThreshold
            query.$expr = { $lte: ['$quantity', '$minThreshold'] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [items, total] = await Promise.all([
            InventoryItem.find(query)
                .populate('branch', 'name')
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            InventoryItem.countDocuments(query)
        ]);

        return reply.code(200).send({
            success: true,
            data: items,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch inventory items.' });
    }
};

export const createItem = async (request, reply) => {
    try {
        const item = await InventoryItem.create(request.body);
        return reply.code(201).send({ success: true, message: 'Item created successfully.', data: item });
    } catch (error) {
        logger.error(error);
        if (error.code === 11000) return reply.code(409).send({ success: false, message: 'SKU already exists.' });
        return reply.code(500).send({ success: false, message: 'Failed to create inventory item.' });
    }
};

export const updateStock = async (request, reply) => {
    const session = await InventoryItem.startSession();
    session.startTransaction();
    try {
        const { id } = request.params;
        const { type, quantity, targetStudent, targetUser, note, dateTime } = request.body;

        const item = await InventoryItem.findById(id).session(session);
        if (!item) {
            await session.abortTransaction();
            return reply.code(404).send({ success: false, message: 'Item not found.' });
        }

        // Calculate new quantity
        // Quantity in request is the CHANGE. Usually distribution is negative, purchase is positive.
        // We enforce signs based on type if needed, but here we assume the user provides the delta.
        // Let's improve: if type is 'distribution' or 'loss', we ensure we subtract.
        let delta = quantity;
        if (['distribution', 'loss'].includes(type) && delta > 0) delta = -delta;
        if (['purchase', 'return'].includes(type) && delta < 0) delta = -delta;

        const newQuantity = item.quantity + delta;
        if (newQuantity < 0) {
            await session.abortTransaction();
            return reply.code(400).send({ success: false, message: 'Insufficient stock.' });
        }

        item.quantity = newQuantity;
        await item.save({ session });

        await InventoryLog.create([{
            item: id,
            type,
            quantity: delta,
            targetStudent: targetStudent || null,
            targetUser: targetUser || null,
            recordedBy: request.user._id,
            note: note || '',
            dateTime: dateTime || new Date()
        }], { session });

        await session.commitTransaction();
        return reply.send({ success: true, message: 'Stock updated and logged.', currentQuantity: newQuantity });
    } catch (error) {
        await session.abortTransaction();
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update stock.' });
    } finally {
        session.endSession();
    }
};

export const getInventoryLogs = async (request, reply) => {
    try {
        const { page = 1, limit = 10, item, type, branch } = request.query;
        const query = {};

        if (item) query.item = item;
        if (type) query.type = type;
        
        // If branch filtering is needed, we'd need a sub-query or aggregation because InventoryLog doesn't have Branch field direct
        // But for common usage, item filtering is enough.

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            InventoryLog.find(query)
                .populate('item', 'name sku')
                .populate('targetStudent', 'fullNameEn')
                .populate('targetUser', 'fullName')
                .populate('recordedBy', 'fullName')
                .sort({ dateTime: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            InventoryLog.countDocuments(query)
        ]);

        return reply.send({
            success: true,
            data: logs,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch inventory logs.' });
    }
};

export const exportInventory = async (request, reply) => {
    try {
        const items = await InventoryItem.find().populate('branch', 'name').lean();

        const csvData = items.map(i => ({
            Name: i.name,
            SKU: i.sku,
            Category: i.category,
            Quantity: i.quantity,
            Unit: i.unit,
            'Min Threshold': i.minThreshold,
            Price: i.price,
            Branch: i.branch?.name || 'N/A'
        }));

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="inventory_export.csv"`);
        return reply.send(stringify(csvData, { header: true }));
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export inventory.' });
    }
};

export const importInventory = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        let processed = 0;
        const parser = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of parser) {
            if (row['SKU']) {
                await InventoryItem.findOneAndUpdate(
                    { sku: row['SKU'].toUpperCase() },
                    {
                        name: row['Name'],
                        category: row['Category'],
                        quantity: parseInt(row['Quantity']) || 0,
                        unit: row['Unit'] || 'pcs',
                        minThreshold: parseInt(row['Min Threshold']) || 5,
                        price: parseFloat(row['Price']) || 0,
                        branch: request.user.branch || null
                    },
                    { upsert: true, new: true }
                );
                processed++;
            }
        }

        return reply.send({ success: true, message: `Processed ${processed} inventory items.` });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import inventory.' });
    }
};
