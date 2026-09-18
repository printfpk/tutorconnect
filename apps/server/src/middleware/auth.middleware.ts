import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, IUser } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';
import type { Role } from '../config/constants.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
      userRole?: Role;
    }
  }
}

interface JwtPayload {
  userId: string;
  role: Role;
}

/**
 * Authenticate JWT access token
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'UNAUTHORIZED', 'Access token is required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'TOKEN_EXPIRED', 'Access token has expired', 401);
    } else {
      sendError(res, 'INVALID_TOKEN', 'Invalid access token', 401);
    }
  }
}

/**
 * Authenticate and load full user object
 */
export async function authenticateAndLoadUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'UNAUTHORIZED', 'Access token is required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      sendError(res, 'USER_NOT_FOUND', 'User not found', 401);
      return;
    }

    if (user.status !== 'active') {
      sendError(res, 'ACCOUNT_INACTIVE', 'Account is not active', 403);
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role as Role;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'TOKEN_EXPIRED', 'Access token has expired', 401);
    } else {
      sendError(res, 'INVALID_TOKEN', 'Invalid access token', 401);
    }
  }
}

/**
 * Authorize specific roles
 */
export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      sendError(
        res,
        'FORBIDDEN',
        'You do not have permission to perform this action',
        403
      );
      return;
    }
    next();
  };
}
