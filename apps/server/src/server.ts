import { createServer } from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env, validateEnv } from './config/env.js';
import { logger } from './utils/logger.js';
import { initializeSocket } from './socket/index.js';

async function startServer(): Promise<void> {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initializeSocket(httpServer);

    // Start listening
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📡 API: ${env.SERVER_URL}/api/v1`);
      logger.info(`🔌 WebSocket: ${env.SERVER_URL}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
