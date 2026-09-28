import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    try {
      const mailOptions = {
        from: `Private Tutor Marketplace <${env.EMAIL_FROM}>`,
        to,
        subject: 'Password Reset Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p style="color: #555; font-size: 16px;">Hello,</p>
            <p style="color: #555; font-size: 16px;">We received a request to reset your password. Use the verification code below to complete the process:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; background-color: #f4f4f4; padding: 10px 20px; border-radius: 4px; letter-spacing: 4px;">${otp}</span>
            </div>
            <p style="color: #555; font-size: 14px;">This code will expire in 15 minutes.</p>
            <p style="color: #555; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Private Tutor Marketplace. All rights reserved.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      
      // If using ethereal email for dev, log the preview URL
      if (env.SMTP_HOST === 'smtp.ethereal.email') {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      logger.error('Error sending email', error);
      throw new Error('Failed to send email');
    }
  }
}

export const emailService = new EmailService();
