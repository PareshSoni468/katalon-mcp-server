import winston from 'winston';
import path from 'path';

// Define log levels and colors
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
};

// Add colors to winston
winston.addColors(logColors);

// Create custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        const serviceStr = service ? `[${service}]` : '';
        return `${timestamp} ${level} ${serviceStr}: ${message} ${metaStr}`;
    })
);

// Create custom format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || 'info',
    format: fileFormat,
    defaultMeta: { service: 'katalon-mcp-server' },
    transports: [
        // Write all logs with importance level of 'error' or higher to error.log
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

// Helper functions for different log levels
export const log = {
    error: (message: string, meta?: Record<string, any>): void => {
        logger.error(message, meta);
    },
    warn: (message: string, meta?: Record<string, any>): void => {
        logger.warn(message, meta);
    },
    info: (message: string, meta?: Record<string, any>): void => {
        logger.info(message, meta);
    },
    debug: (message: string, meta?: Record<string, any>): void => {
        logger.debug(message, meta);
    },
};

// Export the main logger instance
export default logger;

// Utility function to create child loggers for specific modules
export function createModuleLogger(moduleName: string): typeof log {
    return {
        error: (message: string, meta?: Record<string, any>) => {
            logger.error(message, { ...meta, module: moduleName });
        },
        warn: (message: string, meta?: Record<string, any>) => {
            logger.warn(message, { ...meta, module: moduleName });
        },
        info: (message: string, meta?: Record<string, any>) => {
            logger.info(message, { ...meta, module: moduleName });
        },
        debug: (message: string, meta?: Record<string, any>) => {
            logger.debug(message, { ...meta, module: moduleName });
        },
    };
}
