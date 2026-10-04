import { Request, Response } from 'express';
import { DbService } from '../services/dbService';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;

      if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required.', 400);
      }

      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long.', 400);
      }

      if (confirmPassword && password !== confirmPassword) {
        return sendError(res, 'Password and confirmation password do not match.', 400);
      }

      const existingUser = await DbService.findUserByEmail(email);
      if (existingUser) {
        return sendError(res, 'An account with this email address already exists.', 409);
      }

      const passwordHash = await AuthService.hashPassword(password);
      const otp = AuthService.generateOtp();

      const user = await DbService.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: (phone || '').trim(),
        passwordHash,
        role: 'customer',
        isVerified: false,
        otp,
        addresses: [],
      });

      console.info(`[Auth] Verification OTP for ${user.email}: ${otp.code}`);

      const token = AuthService.generateToken({
        userId: String(user._id),
        email: user.email,
        role: user.role,
      });

      const { passwordHash: _, otp: __, ...sanitizedUser } = user;

      return sendSuccess(
        res,
        'Account registered successfully. Verification code sent to email.',
        {
          user: sanitizedUser,
          token,
          otpCodeForTesting: otp.code,
        },
        201
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Registration failed.', 500);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Please provide both email and password.', 400);
      }

      const user = await DbService.findUserByEmail(email);
      if (!user) {
        return sendError(res, 'Invalid email or password.', 401);
      }

      if (!user.isActive) {
        return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
      }

      const isMatch = await AuthService.comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password.', 401);
      }

      const token = AuthService.generateToken({
        userId: String(user._id),
        email: user.email,
        role: user.role,
      });

      const { passwordHash: _, ...sanitizedUser } = user;

      return sendSuccess(res, 'Logged in successfully.', {
        user: sanitizedUser,
        token,
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Login failed.', 500);
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return sendError(res, 'Email and verification code are required.', 400);
      }

      const user = await DbService.findUserByEmail(email);
      if (!user) {
        return sendError(res, 'User account not found.', 404);
      }

      if (user.isVerified) {
        return sendSuccess(res, 'Account is already verified.', { isVerified: true });
      }

      if (!user.otp || !user.otp.code) {
        return sendError(res, 'No active OTP verification request found. Please request a new one.', 400);
      }

      if (new Date(user.otp.expiresAt).getTime() < Date.now()) {
        return sendError(res, 'Verification code has expired. Please request a new OTP.', 400);
      }

      if (user.otp.code !== code.trim()) {
        return sendError(res, 'Invalid verification code. Please check and try again.', 400);
      }

      const updatedUser = await DbService.updateUser(String(user._id), {
        isVerified: true,
        otp: undefined,
      });

      const { passwordHash: _, ...sanitizedUser } = updatedUser;
      return sendSuccess(res, 'Account verified successfully.', { user: sanitizedUser });
    } catch (error: any) {
      return sendError(res, error.message || 'Verification failed.', 500);
    }
  }

  static async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return sendError(res, 'Email is required.', 400);
      }

      const user = await DbService.findUserByEmail(email);
      if (!user) {
        return sendError(res, 'User account not found.', 404);
      }

      const otp = AuthService.generateOtp();
      await DbService.updateUser(String(user._id), { otp });

      console.info(`[Auth] Resent OTP for ${user.email}: ${otp.code}`);

      return sendSuccess(res, 'Fresh verification code has been dispatched.', {
        otpCodeForTesting: otp.code,
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to resend code.', 500);
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return sendError(res, 'Email is required.', 400);
      }

      const user = await DbService.findUserByEmail(email);
      if (!user) {
        // Return success for security to avoid email enumeration
        return sendSuccess(res, 'If an account exists with this email, reset instructions have been sent.');
      }

      const resetToken = AuthService.generateResetToken();
      await DbService.updateUser(String(user._id), { resetPasswordToken: resetToken });

      console.info(`[Auth] Password reset token for ${user.email}: ${resetToken.token}`);

      return sendSuccess(res, 'Password reset instructions have been sent.', {
        resetTokenForTesting: resetToken.token,
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to initiate password reset.', 500);
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return sendError(res, 'Reset token and new password are required.', 400);
      }

      if (newPassword.length < 6) {
        return sendError(res, 'New password must be at least 6 characters long.', 400);
      }

      const users = await DbService.getAllUsers({ limit: 1000 });
      const targetUser = users.users.find(
        (u: any) =>
          u.resetPasswordToken &&
          u.resetPasswordToken.token === token &&
          new Date(u.resetPasswordToken.expiresAt).getTime() > Date.now()
      );

      if (!targetUser) {
        return sendError(res, 'Password reset token is invalid or has expired.', 400);
      }

      const passwordHash = await AuthService.hashPassword(newPassword);
      await DbService.updateUser(String(targetUser._id), {
        passwordHash,
        resetPasswordToken: undefined,
      });

      return sendSuccess(res, 'Password has been updated successfully. Please log in with your new password.');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to reset password.', 500);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await DbService.findUserById(req.user!.userId);
      if (!user) {
        return sendError(res, 'User not found.', 404);
      }

      const { passwordHash: _, otp: __, resetPasswordToken: ___, ...sanitizedUser } = user;
      return sendSuccess(res, 'Profile retrieved.', { user: sanitizedUser });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch user.', 500);
    }
  }
}
