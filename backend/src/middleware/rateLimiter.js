// backend/src/middleware/rateLimiter.js
// Rate limiting middleware to prevent abuse

const rateLimit = require('express-rate-limit');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * General rate limiter for all routes
 * Limits: 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again after 15 minutes',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  keyGenerator: (req) => {
    // Use IP address as key
    return req.ip || req.connection.remoteAddress;
  },
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  },
});

/**
 * Strict rate limiter for analyze endpoint
 * Limits: 10 requests per hour (prevents API abuse)
 */
const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 analyses per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'You have reached the maximum number of resume analyses per hour (10). Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  keyGenerator: (req) => {
    // Use IP address
    return req.ip || req.connection.remoteAddress;
  },
});

/**
 * Moderate rate limiter for history endpoint
 * Limits: 50 requests per 15 minutes
 */
const historyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please slow down. Maximum 50 requests per 15 minutes.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

/**
 * Very strict limiter for file upload (prevents large file attacks)
 * Limits: 20 uploads per hour
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Upload limit exceeded',
    message: 'You have reached the maximum number of file uploads per hour (20). Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
});

/**
 * Optional: Rate limiter for specific IPs that abuse the API
 * Block after 5 failed requests in 5 minutes
 */
const failedRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 failed requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many failed attempts',
    message: 'Your IP has been temporarily blocked due to too many failed requests',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  skipSuccessfulRequests: true, // Only count failed requests
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
});

/**
 * Cleanup function to reset rate limiters (useful for testing)
 */
function resetRateLimiters() {
  // This would require accessing the internal stores
  // For simplicity, we'll just log it
  console.log('Rate limiter reset requested - implement if needed');
}

module.exports = {
  generalLimiter,
  analyzeLimiter,
  historyLimiter,
  uploadLimiter,
  failedRequestLimiter,
  resetRateLimiters,
};