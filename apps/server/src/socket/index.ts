import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { Role } from '../config/constants.js';

let io: SocketServer;

interface SocketUser {
  userId: string;
  role: Role;
}

export function initializeSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as SocketUser;
      (socket as any).user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as SocketUser;
    logger.debug(`Socket connected: ${user.userId} (${user.role})`);

    // Join user-specific room
    socket.join(`user:${user.userId}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // Handle online status
    socket.broadcast.emit('user:online', { userId: user.userId });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${user.userId}`);
      socket.broadcast.emit('user:offline', { userId: user.userId });
    });

    // Chat events will be added in Phase 6
    // Flash events will be added in Phase 7
    // Tracking events will be added in Phase 8
  });

  logger.info('Socket.IO initialized');
  return io;
}

export function getIO(): SocketServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
