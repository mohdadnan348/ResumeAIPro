// backend/src/middleware/errorHandler.js
// Global error handler middleware

const { HTTP_STATUS } = require('../utils/constants');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler
 * Catches all unmatched routes
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Cannot find ${req.method} ${req.originalUrl}`,
    HTTP_STATUS.NOT_FOUND,
    'ROUTE_NOT_FOUND'
  );
  next(error);
}

/**
 * Global error handler
 * Handles all errors and sends appropriate response
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Default error values
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Handle specific error types
  switch (err.name) {
    case 'ValidationError':
      statusCode = HTTP_STATUS.BAD_REQUEST;
      errorCode = 'VALIDATION_ERROR';
      message = err.message || 'Validation failed';
      break;

    case 'JsonWebTokenError':
      statusCode = HTTP_STATUS.UNAUTHORIZED;
      errorCode = 'INVALID_TOKEN';
      message = 'Invalid authentication token';
      break;

    case 'TokenExpiredError':
      statusCode = HTTP_STATUS.UNAUTHORIZED;
      errorCode = 'TOKEN_EXPIRED';
      message = 'Authentication token has expired';
      break;

    case 'PrismaClientKnownRequestError':
      statusCode = HTTP_STATUS.BAD_REQUEST;
      errorCode = 'DATABASE_ERROR';
      message = 'Database operation failed';
      
      // Handle specific Prisma errors
      if (err.code === 'P2002') {
        message = 'Duplicate entry: A record with this value already exists';
        errorCode = 'DUPLICATE_ENTRY';
      } else if (err.code === 'P2025') {
        statusCode = HTTP_STATUS.NOT_FOUND;
        message = 'Record not found';
        errorCode = 'RECORD_NOT_FOUND';
      }
      break;

    case 'MulterError':
      statusCode = HTTP_STATUS.BAD_REQUEST;
      errorCode = 'FILE_UPLOAD_ERROR';
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File too large. Maximum size is 5MB';
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        message = 'Too many files. Only one file allowed';
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file field';
      }
      break;
  }

  // Handle OpenAI API errors
  if (err.message?.includes('OpenAI') || err.message?.includes('openai')) {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    errorCode = 'AI_SERVICE_ERROR';
    message = 'AI analysis service is temporarily unavailable. Please try again later.';
  }

  // Handle PDF parsing errors
  if (err.message?.includes('PDF') || err.message?.includes('pdf')) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = 'PDF_PARSE_ERROR';
    message = 'Unable to read PDF file. Please ensure it is a valid, non-protected PDF.';
  }

  // Send response based on environment
  const response = {
    success: false,
    error: message,
    errorCode: errorCode,
  };

  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Handle duplicate key errors from database
  if (err.code === 11000) {
    response.error = 'Duplicate entry detected';
    response.errorCode = 'DUPLICATE_ENTRY';
    statusCode = HTTP_STATUS.BAD_REQUEST;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
};