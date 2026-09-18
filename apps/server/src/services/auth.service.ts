import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { env } from '../config/env.js';
import { USER_STATUS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import type { RegisterInput, LoginInput } from '../validation/auth.validation.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: IUser;
  tokens: TokenPair;
}

class AuthService {
  /**
   * Generate JWT access token
   */
  generateAccessToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY as string }
    );
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY as string }
    );
  }

  /**
   * Generate both tokens
   */
  generateTokens(userId: string, role: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(userId, role),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    // Check if user exists
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Create user (password is hashed by pre-save hook)
    const userData: any = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      pincode: (input as any).pincode,
      password: input.password,
      role: input.role,
    };

    // If lat/lng provided, store as GeoJSON Point (optional — Google Maps location)
    if ((input as any).latitude && (input as any).longitude) {
      userData.location = {
        type: 'Point',
        coordinates: [(input as any).longitude, (input as any).latitude],
      };
    }

    const user = await User.create(userData);

    // Generate tokens
    const tokens = this.generateTokens(user._id.toString(), user.role);

    // Store refresh token
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User registered: ${user.email} (${user.role})`);

    return { user, tokens };
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<AuthResult> {
    // Find user with password
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check account status
    if (user.status === USER_STATUS.SUSPENDED) {
      throw new AppError('Account is suspended', 403, 'ACCOUNT_SUSPENDED');
    }
    if (user.status === USER_STATUS.BLOCKED) {
      throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = this.generateTokens(user._id.toString(), user.role);

    // Update refresh token and last login
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    return { user, tokens };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
      };

      // Find user and verify stored refresh token
      const user = await User.findById(decoded.userId).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
      }

      // Check account status
      if (user.status !== USER_STATUS.ACTIVE) {
        throw new AppError('Account is not active', 403, 'ACCOUNT_INACTIVE');
      }

      // Generate new tokens (refresh token rotation)
      const tokens = this.generateTokens(user._id.toString(), user.role);

      // Store new refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    logger.info(`User logged out: ${userId}`);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    logger.info(`Password changed for user: ${userId}`);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: { firstName?: string; lastName?: string; phone?: string | null }
  ): Promise<IUser> {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user;
  }
}

// Custom application error
export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const authService = new AuthService();
