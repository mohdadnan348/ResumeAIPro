// backend/src/routes/analysis.js
// GET /api/analysis/:id - Single analysis endpoints

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const { 
  getAnalysisByIdController, 
  getAnalysisStatsController 
} = require('../controllers/analysisController');
const { validateIdParam } = require('../middleware/validation');
const { generalLimiter } = require('../middleware/rateLimiter');

/**
 * GET /api/analysis/:id
 * Get single analysis by ID
 * 
 * Path Parameters:
 * - id: string (UUID)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: "uuid",
 *     targetRole: "Full Stack Developer",
 *     atsScore: 85,
 *     roleMatch: 78,
 *     missingKeywords: [...],
 *     strengths: [...],
 *     weaknesses: [...],
 *     suggestions: [...],
 *     interviewChance: "medium",
 *     oneLinerFeedback: "...",
 *     createdAt: "2024-01-15T10:30:00Z",
 *     resumeTextPreview: "..."
 *   }
 * }
 */
router.get(
  '/analysis/:id',
  generalLimiter,
  validateIdParam,
  getAnalysisByIdController
);

/**
 * GET /api/analysis/stats/summary
 * Get overall analysis statistics
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     totalAnalyses: 50,
 *     averageScore: 72,
 *     bestScore: 95,
 *     worstScore: 35,
 *     topMissingKeywords: [
 *       { keyword: "Docker", count: 25 },
 *       { keyword: "GraphQL", count: 20 }
 *     ]
 *   }
 * }
 */
router.get(
  '/analysis/stats/summary',
  generalLimiter,
  getAnalysisStatsController
);

/**
 * GET /api/analysis/health/check
 * Simple health check for analysis route
 */
router.get('/analysis/health/check', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /analysis/:id',
      'GET /analysis/stats/summary',
      'GET /analysis/health/check',
    ],
  });
});

module.exports = router;