// backend/src/index.js
// Server entry point - Starts the Express server

// 🔥 IMPORTANT: Load environment variables FIRST (sabse pehle)
require('dotenv').config();

// 🔥 DEBUG: Check if API key is loaded (temporary)
console.log('🔍 Environment Variables Check:');
console.log('📡 OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Loaded (' + process.env.OPENAI_API_KEY.substring(0, 20) + '...)' : '❌ MISSING');
console.log('🗄️ DATABASE_URL:', process.env.DATABASE_URL ? '✅ Loaded' : '❌ MISSING');
console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('');

// Now require other modules
const app = require('./app');
const { connectDB, disconnectDB, healthCheck } = require('./config/database');
const { DEFAULTS, isDevelopment, isProduction } = require('./utils/constants');

// Define port
const PORT = process.env.PORT || DEFAULTS.PORT;

/**
 * Initialize server and database connections
 */
async function startServer() {
  try {
    // Connect to database
    console.log('🔌 Initializing database connection...');
    const dbConnected = await connectDB();
    
    if (!dbConnected && isProduction) {
      throw new Error('Failed to connect to database in production mode');
    }
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 ResumeAI Pro Server Started Successfully!          ║
║                                                          ║
║   📡 Server: http://localhost:${PORT}                      ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   💾 Database: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}               ║
║   🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}               ║
║                                                          ║
║   📚 API Endpoints:                                      ║
║   • POST   /api/analyze     - Analyze resume           ║
║   • GET    /api/history     - Get analysis history     ║
║   • DELETE /api/history/:id - Delete analysis          ║
║   • GET    /api/analysis/:id - Get single analysis     ║
║   • GET    /api/analysis/stats/summary - Get stats     ║
║   • GET    /health          - Health check             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
    
    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n📡 ${signal} received. Starting graceful shutdown...`);
      
      // Close server first (stop accepting new connections)
      server.close(async () => {
        console.log('🛑 HTTP server closed');
        
        // Disconnect from database
        await disconnectDB();
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
      
      // Force shutdown after timeout
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
    
    // Periodic health check (every 30 seconds in production)
    if (isProduction) {
      setInterval(async () => {
        const health = await healthCheck();
        if (!health.healthy) {
          console.error('⚠️ Database health check failed:', health.error);
        }
      }, 30000);
    }
    
    return server;
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * For testing purposes - allow closing the server
 */
let serverInstance = null;

async function stopServer() {
  if (serverInstance) {
    await disconnectDB();
    serverInstance.close();
    serverInstance = null;
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer, stopServer };