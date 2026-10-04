import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: '7d',
    });
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  static generateOtp(): { code: string; expiresAt: Date } {
    // Secure 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return { code, expiresAt };
  }

  static generateResetToken(): { token: string; expiresAt: Date } {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return { token, expiresAt };
  }
}
