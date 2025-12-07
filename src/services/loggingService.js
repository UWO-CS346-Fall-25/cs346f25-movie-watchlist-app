/**
 * Application Logging Service
 *
 * Centralized logging service that provides consistent logging
 * across the entire application with structured formats
 */

const logger = require('../config/logger');

class LoggingService {
  constructor() {
    this.logger = logger;
  }

  // Authentication logging
  logAuthSuccess(userId, email, action = 'login') {
    this.logger.info(`Authentication Success: ${action}`, {
      userId,
      email: email.replace(/(.{2}).*@(.*)/, '$1***@$2'), // Partially mask email
      action,
      timestamp: new Date().toISOString(),
    });
  }

  logAuthFailure(email, reason, action = 'login') {
    this.logger.warn(`Authentication Failure: ${action}`, {
      email: email ? email.replace(/(.{2}).*@(.*)/, '$1***@$2') : 'unknown',
      reason,
      action,
      timestamp: new Date().toISOString(),
    });
  }

  logAuthAttempt(email, action = 'login') {
    this.logger.info(`Authentication Attempt: ${action}`, {
      email: email.replace(/(.{2}).*@(.*)/, '$1***@$2'),
      action,
      timestamp: new Date().toISOString(),
    });
  }

  // Database operation logging
  logDatabaseOperation(operation, table, userId = null, details = {}) {
    this.logger.info(`Database Operation: ${operation}`, {
      operation,
      table,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  logDatabaseError(operation, table, error, userId = null) {
    this.logger.error(`Database Error: ${operation} on ${table}`, {
      operation,
      table,
      userId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  // API operation logging
  logApiCall(
    endpoint,
    method,
    userId = null,
    responseTime = null,
    status = null
  ) {
    this.logger.info(`API Call: ${method} ${endpoint}`, {
      endpoint,
      method,
      userId,
      responseTime,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  logApiError(endpoint, method, error, userId = null) {
    this.logger.error(`API Error: ${method} ${endpoint}`, {
      endpoint,
      method,
      userId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  // Business logic logging
  logMovieAction(action, movieData, userId) {
    this.logger.info(`Movie Action: ${action}`, {
      action,
      movieId: movieData.id,
      movieTitle: movieData.title,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  logUserAction(action, userId, details = {}) {
    this.logger.info(`User Action: ${action}`, {
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Security logging
  logSecurityEvent(event, userId = null, details = {}) {
    this.logger.warn(`Security Event: ${event}`, {
      event,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  logSuspiciousActivity(activity, userId = null, details = {}) {
    this.logger.error(`Suspicious Activity: ${activity}`, {
      activity,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Session logging
  logSessionStart(sessionId, userId) {
    this.logger.info('Session Started', {
      sessionId: sessionId.substring(0, 8) + '...',
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  logSessionEnd(sessionId, userId, reason = 'logout') {
    this.logger.info('Session Ended', {
      sessionId: sessionId.substring(0, 8) + '...',
      userId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  // Error logging
  logApplicationError(error, context = {}) {
    this.logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Performance logging
  logPerformance(operation, duration, details = {}) {
    const level = duration > 1000 ? 'warn' : 'info'; // Warn if operation takes more than 1 second

    this.logger[level](`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Configuration and startup logging
  logStartup(port, environment) {
    this.logger.info('Application Started', {
      port,
      environment,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });
  }

  logShutdown(reason = 'unknown') {
    this.logger.info('Application Shutdown', {
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  // Generic logging methods for backward compatibility
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
}

// Export singleton instance
module.exports = new LoggingService();
