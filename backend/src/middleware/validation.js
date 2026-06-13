// backend/src/middleware/validation.js
// Request validation middleware

const { z } = require('zod');
const { AVAILABLE_ROLES } = require('../utils/constants');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Validate analyze request body
 */
const validateAnalyzeRequest = (req, res, next) => {
  try {
    // Define validation schema
    const analyzeSchema = z.object({
      role: z.string()
        .min(2, 'Role must be at least 2 characters')
        .max(50, 'Role cannot exceed 50 characters')
        .trim(),
      // Optional fields
      userId: z.string().optional(),
    });

    // Parse and validate
    const validatedData = analyzeSchema.parse(req.body);
    req.body = validatedData;
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

/**
 * Validate file upload
 */
const validateFileUpload = (req, res, next) => {
  // Check if file exists
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'No file uploaded',
      message: 'Please upload a PDF file',
    });
  }

  // Check file type
  const allowedMimeTypes = ['application/pdf'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid file type',
      message: 'Only PDF files are allowed',
      allowedTypes: allowedMimeTypes,
    });
  }

  // Check file size (5MB = 5 * 1024 * 1024)
  const maxSize = 5 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'File too large',
      message: `File size cannot exceed ${Math.floor(maxSize / 1024 / 1024)}MB`,
      maxSizeMB: Math.floor(maxSize / 1024 / 1024),
    });
  }

  next();
};

/**
 * Validate role parameter
 */
const validateRole = (req, res, next) => {
  const { role } = req.body;
  
  if (!role) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Missing role',
      message: 'Please provide a target job role',
    });
  }

  // Check if role is valid (either in predefined list or custom)
  const isPredefinedRole = AVAILABLE_ROLES.some(
    r => r.toLowerCase() === role.toLowerCase()
  );
  
  if (!isPredefinedRole && (role.length < 2 || role.length > 50)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid role',
      message: 'Role must be either a predefined role or a custom role between 2-50 characters',
      predefinedRoles: AVAILABLE_ROLES,
    });
  }

  next();
};

/**
 * Validate ID parameter
 */
const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  
  // UUID v4 regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!id) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Missing ID parameter',
    });
  }
  
  if (!uuidRegex.test(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid ID format',
      message: 'ID must be a valid UUID',
    });
  }
  
  next();
};

/**
 * Validate pagination query parameters
 */
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  // Validate page
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid page parameter',
        message: 'Page must be a positive integer',
      });
    }
    req.query.page = pageNum;
  }
  
  // Validate limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 100',
      });
    }
    req.query.limit = limitNum;
  }
  
  next();
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  // Sanitize body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }
  
  // Sanitize query
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitize(req.query[key]);
      }
    }
  }
  
  next();
};

module.exports = {
  validateAnalyzeRequest,
  validateFileUpload,
  validateRole,
  validateIdParam,
  validatePagination,
  sanitizeInput,
};