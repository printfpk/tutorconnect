import { Request, Response } from 'express';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import mongoose from 'mongoose';

// Get all chats for the logged in user
export const getChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .populate('participants', 'firstName lastName avatar role')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();
    sendSuccess(res, { chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    sendError(res, 'FETCH_CHATS_ERROR', 'Failed to fetch chats', 500);
  }
};

// Get messages for a specific chat
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    
    // Ensure user is part of the chat
    const chat = await Chat.findOne({ _id: chatId, participants: req.userId });
    if (!chat) {
      sendError(res, 'NOT_FOUND', 'Chat not found', 404);
      return;
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 }) // oldest to newest for UI rendering
      .lean();
      
    sendSuccess(res, { messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    sendError(res, 'FETCH_MESSAGES_ERROR', 'Failed to fetch messages', 500);
  }
};

// Create a new chat or get existing one
export const createOrGetChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { partnerId } = req.body;
    if (!partnerId) {
      sendError(res, 'INVALID_INPUT', 'partnerId is required', 400);
      return;
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, partnerId] }
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.userId, partnerId]
      });
    }

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'firstName lastName avatar role')
      .lean();

    sendSuccess(res, { chat: populatedChat }, 201);
  } catch (error) {
    console.error('Error creating chat:', error);
    sendError(res, 'CREATE_CHAT_ERROR', 'Failed to create chat', 500);
  }
};
// Send a message via REST (more reliable than sockets for initial implementation)
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      sendError(res, 'INVALID_INPUT', 'Message content is required', 400);
      return;
    }

    const chat = await Chat.findOne({ _id: chatId, participants: req.userId });
    if (!chat) {
      sendError(res, 'NOT_FOUND', 'Chat not found', 404);
      return;
    }

    const newMessage = await Message.create({
      chatId,
      senderId: req.userId,
      content: content.trim(),
      readBy: [req.userId]
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id, updatedAt: new Date() });

    sendSuccess(res, { message: newMessage }, 201);
  } catch (error) {
    console.error('Error sending message:', error);
    sendError(res, 'SEND_MESSAGE_ERROR', 'Failed to send message', 500);
  }
};
