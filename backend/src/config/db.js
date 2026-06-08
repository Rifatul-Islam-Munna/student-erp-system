import mongoose from 'mongoose';
import logger from '../services/logger.service.js';

const connectDB = async () => {
    const options = {
        autoIndex: process.env.NODE_ENV !== 'production',
        minPoolSize: process.env.MONGO_MIN_POOL_SIZE ? parseInt(process.env.MONGO_MIN_POOL_SIZE) : 5,
        maxPoolSize: process.env.MONGO_MAX_POOL_SIZE ? parseInt(process.env.MONGO_MAX_POOL_SIZE) : 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: false,
    };

    try {
        mongoose.connection.on('connected', () => {
            logger.info('Mongoose connected to DB');
        });

        mongoose.connection.on('error', (err) => {
            logger.error(`Mongoose connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.info('Mongoose disconnected');
        });

        mongoose.connection.closeConnection = async () => {
            await mongoose.connection.close();
            logger.info('Mongoose disconnected');
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
