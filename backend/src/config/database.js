// backend/src/config/database.js
// Database configuration and connection management

const { PrismaClient } = require('@prisma/client');
const { DATABASE_CONFIG, isDevelopment, isProduction, isTest } = require('../utils/constants');

// Create Prisma client instance with optimized settings
const prisma = new PrismaClient({
  log: isDevelopment ? ['query', 'error', 'warn', 'info'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
const CONNECTION_RETRY_DELAY = 2000; // 2 seconds

/**
 * Connect to database with retry logic
 * @returns {Promise<boolean>} - Connection status
 */
async function connectDB() {
  if (isConnected) {
    console.log('✅ Database already connected');
    return true;
  }

  try {
    console.log('📡 Connecting to PostgreSQL database...');
    
    await prisma.$connect();
    isConnected = true;
    connectionAttempts = 0;
    
    console.log('✅ PostgreSQL connected successfully');
    
    // Test the connection by running a simple query
    await testConnection();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      connectionAttempts++;
      console.log(`🔄 Retrying connection... Attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}`);
      
      await new Promise(resolve => setTimeout(resolve, CONNECTION_RETRY_DELAY));
      return connectDB();
    }
    
    if (isProduction) {
      console.error('💀 Fatal: Cannot connect to database in production');
      process.exit(1);
    }
    
    return false;
  }
}

/**
 * Test database connection by running a simple query
 */
async function testConnection() {
  try {
    // Try to query the database (get count of analyses)
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('🔍 Database test query successful');
    return true;
  } catch (error) {
    console.warn('⚠️ Database test query failed:', error.message);
    return false;
  }
}

/**
 * Disconnect from database gracefully
 */
async function disconnectDB() {
  if (!isConnected) {
    return;
  }
  
  try {
    console.log('📡 Disconnecting from database...');
    await prisma.$disconnect();
    isConnected = false;
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error.message);
  }
}

/**
 * Get database connection status
 * @returns {Object} - Connection status info
 */
function getConnectionStatus() {
  return {
    isConnected,
    connectionAttempts,
    maxAttempts: MAX_CONNECTION_ATTEMPTS,
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * Check if database is healthy
 * @returns {Promise<Object>} - Health check result
 */
async function healthCheck() {
  const startTime = Date.now();
  
  try {
    // Run a simple query to check response time
    const result = await prisma.$queryRaw`SELECT 1 as healthy`;
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: true,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} - Database stats
 */
async function getDatabaseStats() {
  try {
    // Get counts from all tables
    const [analysisCount, historyCount] = await Promise.all([
      prisma.analysis.count(),
      prisma.analysisHistory?.count() || 0,
    ]);
    
    // Get recent activity
    const recentAnalyses = await prisma.analysis.findMany({
      select: {
        createdAt: true,
        atsScore: true,
        targetRole: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    return {
      totalAnalyses: analysisCount,
      totalHistoryRecords: historyCount,
      recentActivity: recentAnalyses,
      averageScore: await getAverageScore(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting database stats:', error.message);
    return null;
  }
}

/**
 * Get average ATS score of all analyses
 * @returns {Promise<number>} - Average score
 */
async function getAverageScore() {
  try {
    const result = await prisma.analysis.aggregate({
      _avg: {
        atsScore: true,
      },
    });
    
    return Math.round(result._avg.atsScore || 0);
  } catch (error) {
    console.error('Error calculating average score:', error.message);
    return 0;
  }
}

/**
 * Clean up old data (if needed)
 * @param {number} daysToKeep - Keep data from last N days
 */
async function cleanupOldData(daysToKeep = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const deleted = await prisma.analysis.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`🧹 Cleaned up ${deleted.count} old analysis records`);
    return deleted.count;
  } catch (error) {
    console.error('Error cleaning up old data:', error.message);
    return 0;
  }
}

// Handle application shutdown gracefully
process.on('beforeExit', async () => {
  console.log('🔄 Application shutting down, closing database connection...');
  await disconnectDB();
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, closing database connection...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, closing database connection...');
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
  testConnection,
  getConnectionStatus,
  healthCheck,
  getDatabaseStats,
  cleanupOldData,
  getAverageScore,
  isConnected: () => isConnected,
};