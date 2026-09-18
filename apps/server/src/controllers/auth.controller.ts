import { Request, Response, NextFunction } from 'express';
import { authService, AppError } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import type { RegisterInput, LoginInput } from '../validation/auth.validation.js';

class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: RegisterInput = req.body;
      const { user, tokens } = await authService.register(input);

      sendSuccess(
        res,
        {
          user,
          tokens,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: LoginInput = req.body;
      const { user, tokens } = await authService.login(input);

      sendSuccess(res, {
        user,
        tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      sendSuccess(res, { tokens });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      await authService.logout(req.userId);
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/change-password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.userId, currentPassword, newPassword);
      sendSuccess(res, { message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      const user = await authService.getUserById(req.userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      sendSuccess(res, { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/auth/profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      const user = await authService.updateProfile(req.userId, req.body);
      sendSuccess(res, { user });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
