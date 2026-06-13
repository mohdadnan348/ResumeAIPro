// backend/src/utils/helpers.js
// Utility helper functions

const { PATTERNS, DEFAULTS, SECTION_KEYWORDS } = require('./constants');

/**
 * Validate if role is valid
 * @param {string} role - Role to validate
 * @param {string[]} availableRoles - List of available roles
 * @returns {boolean} - True if valid
 */
function isValidRole(role, availableRoles) {
  if (!role || typeof role !== 'string') return false;
  
  const trimmedRole = role.trim();
  
  // Check if it's a predefined role
  if (availableRoles.includes(trimmedRole)) return true;
  
  // Or a valid custom role (2-50 characters, no special chars)
  const customRoleRegex = /^[a-zA-Z0-9\s\-\(\)\/]{2,50}$/;
  return customRoleRegex.test(trimmedRole);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength = 5000) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Sanitize text by removing non-printable characters
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  // Remove non-printable characters but keep newlines and tabs
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract email from text
 * @param {string} text - Text to search
 * @returns {string|null} - Extracted email or null
 */
function extractEmail(text) {
  const match = text.match(PATTERNS.EMAIL);
  return match ? match[0] : null;
}

/**
 * Extract phone number from text
 * @param {string} text - Text to search
 * @returns {string|null} - Extracted phone or null
 */
function extractPhone(text) {
  const match = text.match(PATTERNS.PHONE);
  return match ? match[0] : null;
}

/**
 * Extract skills from resume text
 * @param {string} text - Resume text
 * @returns {string[]} - Array of extracted skills
 */
function extractSkills(text) {
  const skills = [];
  const lowerText = text.toLowerCase();
  
  for (const skill of PATTERNS.SKILL_KEYWORDS) {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  }
  
  return [...new Set(skills)]; // Remove duplicates
}

/**
 * Calculate percentage match between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Percentage match (0-100)
 */
function calculateStringMatch(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return (intersection.size / union.size) * 100;
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate random UUID (for fallback)
 * @returns {string} - Random UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} - Result of function
 */
async function retryAsync(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

/**
 * Check if string is valid JSON
 * @param {string} str - String to check
 * @returns {boolean} - True if valid JSON
 */
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse JSON safely without throwing error
 * @param {string} str - JSON string
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - Parsed object or default value
 */
function safeJSONParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * Extract sections from resume
 * @param {string} text - Resume text
 * @returns {Object} - Extracted sections
 */
function extractResumeSections(text) {
  const sections = {
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
    certifications: '',
    achievements: '',
  };
  
  const lines = text.split('\n');
  let currentSection = null;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    // Check for section headers
    for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        currentSection = section.toLowerCase();
        continue;
      }
    }
    
    // Add content to current section
    if (currentSection && line.trim().length > 0 && !line.match(/^[A-Z\s]{5,}$/)) {
      sections[currentSection] += line + '\n';
    }
  }
  
  // Clean up sections
  for (const section in sections) {
    sections[section] = sections[section].trim();
  }
  
  return sections;
}

/**
 * Calculate ATS score based on various factors
 * @param {Object} factors - Scoring factors
 * @returns {number} - Score (0-100)
 */
function calculateATSScore(factors) {
  let score = 0;
  
  // Keyword score (0-30)
  score += (factors.keywordMatch || 0) * 0.3;
  
  // Formatting score (0-20)
  score += (factors.formatting || 0) * 0.2;
  
  // Sections score (0-20)
  score += (factors.sections || 0) * 0.2;
  
  // Metrics score (0-30)
  score += (factors.metrics || 0) * 0.3;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Get score category based on score
 * @param {number} score - ATS score
 * @returns {string} - Category (Excellent, Good, Average, Poor)
 */
function getScoreCategory(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  return 'Poor';
}

/**
 * Get color code for score
 * @param {number} score - ATS score
 * @returns {string} - CSS color code
 */
function getScoreColor(score) {
  if (score >= 90) return '#10B981'; // Green
  if (score >= 70) return '#3B82F6'; // Blue
  if (score >= 50) return '#F59E0B'; // Yellow/Orange
  return '#EF4444'; // Red
}

module.exports = {
  isValidRole,
  truncateText,
  sanitizeText,
  extractEmail,
  extractPhone,
  extractSkills,
  calculateStringMatch,
  formatDate,
  generateUUID,
  sleep,
  retryAsync,
  isValidJSON,
  safeJSONParse,
  extractResumeSections,
  calculateATSScore,
  getScoreCategory,
  getScoreColor,
};