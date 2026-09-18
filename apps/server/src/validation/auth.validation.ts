import { z } from 'zod';
import { ROLES } from '../config/constants.js';

export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters')
      .trim(),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters')
      .trim(),
    email: z
      .string()
      .email('Please provide a valid email')
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .regex(/^[+]?[\d\s-]{7,15}$/, 'Please provide a valid phone number')
      .optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, 'Please provide a valid 6-digit pincode'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
    role: z.enum([ROLES.PARENT, ROLES.STUDENT, ROLES.TUTOR], {
      errorMap: () => ({ message: 'Role must be parent, student, or tutor' }),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please provide a valid email')
      .toLowerCase()
      .trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmNewPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1)
      .max(50)
      .trim()
      .optional(),
    lastName: z
      .string()
      .min(1)
      .max(50)
      .trim()
      .optional(),
    phone: z
      .string()
      .regex(/^[+]?[\d\s-]{7,15}$/, 'Please provide a valid phone number')
      .optional()
      .nullable(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
