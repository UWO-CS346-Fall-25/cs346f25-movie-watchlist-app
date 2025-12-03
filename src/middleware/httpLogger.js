/**
 * HTTP Logging Middleware
 *
 * Configures Morgan for HTTP request logging with custom formats
 * and integration with Winston logger
 */

const morgan = require('morgan');
const logger = require('../config/logger');

// Custom token for user ID (if available in session)
morgan.token('user-id', (req) => {
  return req.session?.user?.id || 'anonymous';
});

// Custom token for session ID
morgan.token('session-id', (req) => {
  return req.sessionID ? req.sessionID.substring(0, 8) + '...' : 'no-session';
});

// Custom token for response time in different colors based on speed
morgan.token('colored-response-time', (req, res) => {
  const responseTime = morgan['response-time'](req, res);
  const time = parseFloat(responseTime);

  if (time < 100) return `\x1b[32m${responseTime}\x1b[0m`; // Green for fast
  if (time < 500) return `\x1b[33m${responseTime}\x1b[0m`; // Yellow for medium
  return `\x1b[31m${responseTime}\x1b[0m`; // Red for slow
});

// Custom token for status code with colors
morgan.token('colored-status', (req, res) => {
  const status = res.statusCode;

  if (status >= 200 && status < 300) return `\x1b[32m${status}\x1b[0m`; // Green for success
  if (status >= 300 && status < 400) return `\x1b[36m${status}\x1b[0m`; // Cyan for redirect
  if (status >= 400 && status < 500) return `\x1b[33m${status}\x1b[0m`; // Yellow for client error
  return `\x1b[31m${status}\x1b[0m`; // Red for server error
});

// Development format with colors and detailed information
const developmentFormat = [
  '📝 :method :url',
  '👤 User: :user-id',
  '🔑 Session: :session-id',
  '📊 Status: :colored-status',
  '⏱️  Time: :colored-response-time ms',
  '📦 Size: :res[content-length] bytes',
  '🔍 User-Agent: :user-agent',
].join(' | ');

// Production format (more concise, structured)
const productionFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  userId: ':user-id',
  sessionId: ':session-id',
  timestamp: ':date[iso]',
  remoteAddr: ':remote-addr',
});

// Skip logging for certain routes (like health checks, static assets)
const skip = (req, _res) => {
  // Skip health check endpoints
  if (req.url === '/health' || req.url === '/ping') return true;

  // Skip static assets in production to reduce noise
  if (process.env.NODE_ENV === 'production') {
    return req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|woff|woff2|ttf|svg)$/);
  }

  return false;
};

// Create different loggers for different environments
const createHttpLogger = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return morgan(isDevelopment ? developmentFormat : productionFormat, {
    stream: logger.stream,
    skip: skip,
  });
};

// Error logging middleware (for 4xx and 5xx responses)
const createErrorLogger = () => {
  return morgan(
    'Error: :method :url :status :res[content-length] - :response-time ms - :user-agent',
    {
      stream: logger.stream,
      skip: (req, res) => res.statusCode < 400,
    }
  );
};

module.exports = {
  httpLogger: createHttpLogger(),
  errorLogger: createErrorLogger(),
};
