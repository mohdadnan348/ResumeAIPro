// backend/src/models/index.js
const { PrismaClient } = require('@prisma/client');

// Create Prisma client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown
async function disconnectDB() {
  await prisma.$disconnect();
  console.log('Database disconnected');
}

// Export models and client
module.exports = {
  prisma,
  testConnection,
  disconnectDB,
  
  // Model references (for easy access)
  models: {
    analysis: prisma.analysis,
    analysisHistory: prisma.analysisHistory,
  },
};