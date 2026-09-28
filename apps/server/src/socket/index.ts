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

    // Chat events
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content } = data;
        const Chat = (await import('../models/Chat.js')).default;
        const Message = (await import('../models/Message.js')).default;
        
        const chat = await Chat.findOne({ _id: chatId, participants: user.userId });
        if (!chat) return; // Unauthorized or not found

        const newMessage = await Message.create({
          chatId,
          senderId: user.userId,
          content,
          readBy: [user.userId]
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id, updatedAt: new Date() });

        const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'firstName lastName avatar').lean();

        // Broadcast to all participants in the chat
        chat.participants.forEach((participantId: string) => {
          io.to(`user:${participantId.toString()}`).emit('new_message', populatedMessage);
        });
      } catch (error) {
        logger.error('Error sending message:', error);
      }
    });

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
