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
  // Check if this is a static asset request
  if (
    req.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return 'static-asset';
  }
  return req.session?.user?.id || 'anonymous';
});

// Custom token for session ID
morgan.token('session-id', (req) => {
  // Check if this is a static asset request
  if (
    req.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return 'static';
  }
  return req.sessionID ? req.sessionID.substring(0, 8) + '...' : 'no-session';
});

// Custom token for request type
morgan.token('request-type', (req) => {
  if (
    req.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return 'STATIC';
  }
  if (req.url.startsWith('/api/')) {
    return 'API';
  }
  return 'PAGE';
});

// Custom token for content size with proper handling of missing values
morgan.token('content-size', (req, res) => {
  const length = res.getHeader('content-length');
  if (length) {
    return `${length} bytes`;
  }
  // For 304 Not Modified responses, there's typically no content-length
  if (res.statusCode === 304) {
    return 'cached';
  }
  return 'unknown';
});

// Custom token for shortened user-agent (for static assets)
morgan.token('short-user-agent', (req) => {
  const userAgent = req.get('User-Agent') || '';
  // For static assets, just show browser name
  if (
    req.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Browser';
  }
  // For regular requests, show full user-agent
  return userAgent;
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
  ':request-type :method :url',
  'User: :user-id',
  'Session: :session-id',
  'Status: :colored-status',
  'Time: :colored-response-time ms',
  'Size: :content-size',
  'UA: :short-user-agent',
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
