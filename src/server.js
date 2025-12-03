/**
 * Server Entry Point
 *
 * This file is responsible for:
 * - Loading environment variables
 * - Starting the Express application
 * - Handling server startup errors
 */

require('dotenv').config();
const app = require('./app');
const loggingService = require('./services/loggingService');

// Server configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);

  // Log application startup
  loggingService.logStartup(PORT, NODE_ENV);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  loggingService.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    loggingService.logShutdown(`Received ${signal}`);
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    loggingService.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle server errors
process.on('unhandledRejection', (err) => {
  loggingService.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack,
  });

  if (NODE_ENV === 'production') {
    gracefulShutdown('unhandledRejection');
  }
});

process.on('uncaughtException', (err) => {
  loggingService.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack,
  });

  if (NODE_ENV === 'production') {
    process.exit(1);
  }
});
