// backend/src/routes/analyze.js
// POST /api/analyze - Resume analysis endpoint

const express = require('express');
const multer = require('multer');
const router = express.Router();

// Import controllers and middleware
const { analyzeResumeController } = require('../controllers/analyzeController');
const { 
  validateFileUpload, 
  validateRole, 
  sanitizeInput 
} = require('../middleware/validation');
const { analyzeLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { FILE_UPLOAD } = require('../utils/constants');

// Configure multer for memory storage (no disk write)
const storage = multer.memoryStorage();

// File filter for PDF only
const fileFilter = (req, file, cb) => {
  if (FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE, // 5MB
  },
  fileFilter: fileFilter,
});

/**
 * POST /api/analyze
 * Analyze resume for specific role
 * 
 * Request:
 * - file: PDF file (multipart/form-data)
 * - role: string (form-data)
 * 
 * Response:
 * {
 *   success: true,
 *   id: "uuid",
 *   ats_score: 85,
 *   role_match_percentage: 78,
 *   missing_keywords: [...],
 *   strengths: [...],
 *   weaknesses: [...],
 *   suggestions: [...],
 *   estimated_interview_chance: "medium",
 *   one_liner_feedback: "..."
 * }
 */
router.post(
  '/analyze',
  uploadLimiter,           // Rate limit for uploads
  analyzeLimiter,          // Rate limit for analysis
  upload.single(FILE_UPLOAD.FIELD_NAME), // Handle file upload
  validateFileUpload,      // Validate file exists, type, size
  validateRole,            // Validate role parameter
  sanitizeInput,           // Sanitize input (XSS protection)
  analyzeResumeController  // Main analysis logic
);

// Handle multer errors specifically
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: `File size cannot exceed ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: 'Only one file can be uploaded at a time',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field',
        message: `Expected field name: ${FILE_UPLOAD.FIELD_NAME}`,
      });
    }
  }
  next(error);
});

module.exports = router;