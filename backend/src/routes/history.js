// backend/src/routes/history.js
// GET /api/history - Fetch analysis history endpoints

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const { 
  getHistoryController, 
  deleteHistoryController 
} = require('../controllers/historyController');
const { 
  validateIdParam, 
  validatePagination 
} = require('../middleware/validation');
const { historyLimiter } = require('../middleware/rateLimiter');

/**
 * GET /api/history
 * Get all analysis history with pagination
 * 
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [...],
 *   pagination: {
 *     currentPage: 1,
 *     totalPages: 5,
 *     totalItems: 48,
 *     itemsPerPage: 10
 *   }
 * }
 */
router.get(
  '/history',
  historyLimiter,
  validatePagination,
  getHistoryController
);

/**
 * DELETE /api/history/:id
 * Delete specific analysis from history
 * 
 * Path Parameters:
 * - id: string (UUID)
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Analysis deleted successfully"
 * }
 */
router.delete(
  '/history/:id',
  historyLimiter,
  validateIdParam,
  deleteHistoryController
);

module.exports = router;