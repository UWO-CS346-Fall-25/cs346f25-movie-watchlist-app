/**
 * Logger Configuration
 * 
 * Provides structured logging using Winston with multiple transports:
 * - Console logging for development
 * - File logging for production
 * - Error-specific logging
 * - HTTP request logging via Morgan
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'grey',
  debug: 'blue',
  silly: 'rainbow'
};

// Add colors to Winston
winston.addColors(logColors);

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss:ms'
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} | ${info.level} | ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// File format (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss:ms'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Create transports array
const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: logFormat
  }),
  
  // Combined logs file
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    level: 'info',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // Error logs file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 3
  }),
  
  // HTTP logs file
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: 'http',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 3
  })
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels: logLevels,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat
    })
  ],
  
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat
    })
  ]
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    // Remove trailing newline that Morgan adds
    logger.http(message.trim());
  }
};

module.exports = logger;