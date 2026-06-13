
// App constants - Centralized configuration

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// Available job roles for dropdown
const AVAILABLE_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'React Native Developer',
  'MERN Stack Developer',
  'Next.js Developer',
  'Node.js Developer',
  'AI/ML Engineer',
  'Software Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Mobile App Developer',
  'Python Developer',
  'Java Developer',
  'Data Scientist',
  'Product Manager',
  'Technical Lead',
  'QA Engineer',
  'Security Engineer',
  'Database Administrator',
];

// File upload configuration
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_SIZE_MB: 5,
  ALLOWED_MIME_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
  FIELD_NAME: 'resume',
  TEMP_DIR: 'uploads/',
};

// AI / OpenAI Configuration
const AI_CONFIG = {
  MODEL: process.env.AI_MODEL || 'deepseek-chat',
  TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE) || 0.3,
  MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS) || 2000,
  FALLBACK_MODEL: 'deepseek-chat',
  REQUEST_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Database Configuration
const DATABASE_CONFIG = {
  MAX_CONNECTIONS: 10,
  IDLE_TIMEOUT: 30000,
  CONNECTION_TIMEOUT: 5000,
};

// Rate Limiting Configuration
const RATE_LIMIT = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  ANALYZE: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 10,
  },
  HISTORY: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 50,
  },
  UPLOAD: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 20,
  },
};

// CORS Configuration
const CORS_CONFIG = {
  ALLOWED_ORIGINS: isDevelopment 
    ? ['http://localhost:3000', 'http://localhost:3001']
    : process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ['https://yourdomain.com'],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
  CREDENTIALS: true,
  MAX_AGE: 86400, // 24 hours
};

// API Response Messages
const MESSAGES = {
  // Success messages
  SUCCESS: {
    ANALYSIS_COMPLETE: 'Resume analysis completed successfully',
    FETCHED_SUCCESS: 'Data fetched successfully',
    DELETED_SUCCESS: 'Deleted successfully',
    HEALTH_OK: 'Server is running smoothly',
  },
  
  // Error messages
  ERROR: {
    INTERNAL: 'Internal server error',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Invalid request',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_FAILED: 'Validation failed',
    FILE_REQUIRED: 'No file uploaded',
    INVALID_FILE_TYPE: 'Invalid file type. Only PDF allowed',
    FILE_TOO_LARGE: `File too large. Max size: ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
    ROLE_REQUIRED: 'Target role is required',
    INVALID_ROLE: 'Invalid role specified',
    AI_SERVICE_ERROR: 'AI service temporarily unavailable',
    DATABASE_ERROR: 'Database operation failed',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  },
};

// Regular Expressions / Patterns
const PATTERNS = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PHONE: /^\+?[\d\s-]{10,}$/,
  SKILL_KEYWORDS: [
    'react', 'node', 'express', 'mongodb', 'postgresql', 'typescript',
    'javascript', 'python', 'java', 'docker', 'kubernetes', 'aws',
    'graphql', 'rest api', 'tailwind', 'next.js', 'redux',
  ],
};

// ATS Scoring Weights
const ATS_WEIGHTS = {
  KEYWORDS: 0.30,    // 30% - Keyword optimization
  FORMATTING: 0.20,  // 20% - ATS-friendly formatting
  SECTIONS: 0.20,    // 20% - Complete sections
  METRICS: 0.30,     // 30% - Action verbs & quantifiable achievements
};

// Section keywords for resume parsing
const SECTION_KEYWORDS = {
  SUMMARY: ['summary', 'profile', 'about me', 'objective', 'personal statement'],
  EXPERIENCE: ['experience', 'work', 'employment', 'job', 'professional history'],
  EDUCATION: ['education', 'academic', 'qualification', 'degree', 'university', 'college'],
  SKILLS: ['skills', 'technical skills', 'core competencies', 'technologies', 'tech stack'],
  PROJECTS: ['projects', 'portfolio', 'personal projects', 'key projects', 'side projects'],
  CERTIFICATIONS: ['certifications', 'certificates', 'courses', 'training'],
  ACHIEVEMENTS: ['achievements', 'awards', 'recognition', 'honors'],
};

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Default values
const DEFAULTS = {
  PORT: 5000,
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  SCORE_THRESHOLDS: {
    EXCELLENT: 90,
    GOOD: 70,
    AVERAGE: 50,
    POOR: 0,
  },
};

// Time constants (in milliseconds)
const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
};

module.exports = {
  isDevelopment,
  isProduction,
  isTest,
  HTTP_STATUS,
  AVAILABLE_ROLES,
  FILE_UPLOAD,
  AI_CONFIG,
  DATABASE_CONFIG,
  RATE_LIMIT,
  CORS_CONFIG,
  MESSAGES,
  PATTERNS,
  ATS_WEIGHTS,
  SECTION_KEYWORDS,
  LOG_LEVELS,
  DEFAULTS,
  TIME,
};