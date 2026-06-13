// backend/src/app.js
// Express app configuration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const analyzeRoutes = require('./routes/analyze');
const historyRoutes = require('./routes/history');
const analysisRoutes = require('./routes/analysis');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import constants
const { CORS_CONFIG, MESSAGES, isDevelopment } = require('./utils/constants');

// Initialize express app
const app = express();

/**
 * Security Middlewares
 */

// Helmet - Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: isDevelopment ? false : undefined,
}));

// CORS - Cross-origin resource sharing
app.use(cors(CORS_CONFIG));

/**
 * Logging Middlewares
 */

// Morgan - HTTP request logging
if (isDevelopment) {
  app.use(morgan('dev')); // Detailed logging in development
} else {
  app.use(morgan('combined')); // Standard logging in production
}

// Custom request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

/**
 * Body Parsing Middlewares
 */

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Static Files
 */

// Serve static files from uploads directory (if needed)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/**
 * Health Check Endpoint (before rate limiting)
 */

// Simple health check for load balancers
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'ResumeAI Pro API',
    version: '1.0.0',
    description: 'AI-powered ATS resume scoring system',
    status: 'running',
    endpoints: {
      analyze: 'POST /api/analyze',
      history: 'GET /api/history',
      analysis: 'GET /api/analysis/:id',
      stats: 'GET /api/analysis/stats/summary',
      health: 'GET /health',
    },
    docs: 'https://github.com/adnanahemd348/resume-ai-pro',
  });
});

/**
 * Apply rate limiting to all API routes
 */
app.use('/api', generalLimiter);

/**
 * API Routes
 */
app.use('/api', analyzeRoutes);
app.use('/api', historyRoutes);
app.use('/api', analysisRoutes);

/**
 * 404 Handler - For unmatched routes
 */
app.use(notFoundHandler);

/**
 * Global Error Handler - Must be last
 */
app.use(errorHandler);

module.exports = app;