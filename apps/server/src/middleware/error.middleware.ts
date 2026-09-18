import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/auth.service.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Application errors
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    sendError(res, 'VALIDATION_ERROR', err.message, 400);
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    sendError(res, 'DUPLICATE_ERROR', `${field} already exists`, 409);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, 'INVALID_ID', 'Invalid resource ID', 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'INVALID_TOKEN', 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'TOKEN_EXPIRED', 'Token has expired', 401);
    return;
  }

  // Unexpected errors
  logger.error('Unhandled error:', err);
  sendError(
    res,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    500
  );
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`, 404);
}
