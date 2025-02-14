// ✅ Move dd-trace to the first line!
const tracer = require('dd-trace').init({
    service: 'ninja-nodejs-service',
    env: 'develop',
    logInjection: true,
    analytics: true,
});

import mongoose from 'mongoose';
import config from '~/config/config';
import app from './app';
import initialData from './config/initialData';
import logger from './config/logger';

// ✅ Enable tracing for Mongoose and HTTP requests
tracer.use('mongoose', { service: 'ninja-nodejs-mongo' });
tracer.use('http', { service: 'ninja-nodejs-http' });

let server;

mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('connecting', () => {
    logger.info('🚀 Connecting to MongoDB...');
});

db.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err}`);
    mongoose.disconnect();
});

db.on('connected', () => {
    logger.info('🚀 Connected to MongoDB!');
});

db.once('open', () => {
    logger.info('🚀 MongoDB connection opened!');
});

db.on('reconnected', () => {
    logger.info('🚀 MongoDB reconnected!');
});

const connect = async () => {
    try {
        await mongoose.connect(config.DATABASE_URI, config.DATABASE_OPTIONS);
        logger.info('🚀 Connected to MongoDB end!');
        await initialData();
        logger.info('🚀 Initial MongoDB!');
        server = app.listen(config.PORT, config.HOST, () => {
            logger.info(`🚀 Host: http://${config.HOST}:${config.PORT}`);
            logger.info('██████╗░░░██╗██╗███████╗');
            logger.info('██╔══██╗░██╔╝██║╚════██║');
            logger.info('██║░░██║██╔╝░██║░░███╔═╝');
            logger.info('██║░░██║███████║██╔══╝░░');
            logger.info('██████╔╝╚════██║███████╗');
            logger.info('╚═════╝░░░░░░╚═╝╚══════╝');
        });
    } catch (err) {
        logger.error(`MongoDB connection error: ${err}`);
    }
};

connect();

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.warn('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (err) => {
    logger.error(err);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
