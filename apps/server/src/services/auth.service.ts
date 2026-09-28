import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { env } from '../config/env.js';
import { USER_STATUS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import type { RegisterInput, LoginInput } from '../validation/auth.validation.js';
import { OAuth2Client } from 'google-auth-library';
import { emailService } from './email.service.js';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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
   * Google Login
   */
  async googleLogin(accessToken: string, role?: string): Promise<AuthResult> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!response.ok) {
        throw new AppError('Invalid Google access token', 401, 'INVALID_TOKEN');
      }

      const payload = await response.json();
      
      if (!payload || !payload.email) {
        throw new AppError('Invalid Google token payload', 401, 'INVALID_TOKEN');
      }

      const { email, sub: googleId, given_name: firstName, family_name: lastName, picture: avatar } = payload;

      let user = await User.findOne({ email });

      if (user) {
        if (user.status === USER_STATUS.SUSPENDED) throw new AppError('Account is suspended', 403, 'ACCOUNT_SUSPENDED');
        if (user.status === USER_STATUS.BLOCKED) throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');

        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }
      } else {
        // Create new user
        user = await User.create({
          firstName: firstName || 'User',
          lastName: lastName || '',
          email,
          googleId,
          role: role || ROLES.PARENT, // default to parent if not specified
          avatar,
          pincode: '000000', // Need default pincode for OAuth
        });
      }

      const tokens = this.generateTokens(user._id.toString(), user.role);
      user.refreshToken = tokens.refreshToken;
      user.lastLogin = new Date();
      await user.save();

      logger.info(`User logged in with Google: ${user.email}`);
      return { user, tokens };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Google authentication failed', 401, 'AUTH_FAILED');
    }
  }

  /**
   * Facebook Login
   */
  async facebookLogin(accessToken: string, role?: string): Promise<AuthResult> {
    try {
      const response = await fetch(`https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture&access_token=${accessToken}`);
      
      if (!response.ok) {
        throw new AppError('Invalid Facebook access token', 401, 'INVALID_TOKEN');
      }

      const payload = await response.json();
      
      if (!payload || !payload.email) {
        throw new AppError('Facebook account must have an email attached', 401, 'INVALID_TOKEN');
      }

      const { email, id: facebookId, first_name: firstName, last_name: lastName } = payload;
      const avatar = payload.picture?.data?.url;

      let user = await User.findOne({ email });

      if (user) {
        if (user.status === USER_STATUS.SUSPENDED) throw new AppError('Account is suspended', 403, 'ACCOUNT_SUSPENDED');
        if (user.status === USER_STATUS.BLOCKED) throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');

        if (!user.facebookId) {
          user.facebookId = facebookId;
          await user.save();
        }
      } else {
        // Create new user
        user = await User.create({
          firstName: firstName || 'User',
          lastName: lastName || '',
          email,
          facebookId,
          role: role || 'parent', // Using literal 'parent' to avoid ROLES import issue if not present
          avatar,
          pincode: '000000', // Need default pincode for OAuth
        });
      }

      const tokens = this.generateTokens(user._id.toString(), user.role);
      user.refreshToken = tokens.refreshToken;
      user.lastLogin = new Date();
      await user.save();

      logger.info(`User logged in with Facebook: ${user.email}`);
      return { user, tokens };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Facebook authentication failed', 401, 'AUTH_FAILED');
    }
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

  /**
   * Forgot password (generates OTP)
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak that user doesn't exist
      return;
    }

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Hash OTP before storing (optional but good practice, here we'll just store plain for simplicity in dev)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send the actual email
    await emailService.sendPasswordResetOtp(email, otp);
  }

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await User.findOne({ 
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordOtp +resetPasswordExpires');
    
    if (!user) {
      throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
    }
    
    return true;
  }

  /**
   * Reset Password
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    const user = await User.findOne({ 
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordOtp +resetPasswordExpires +password');

    if (!user) {
      throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined;
    
    await user.save();
    logger.info(`Password reset via OTP for user: ${email}`);
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
