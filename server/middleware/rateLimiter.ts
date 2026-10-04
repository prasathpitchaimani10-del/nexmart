import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export const rateLimiter = (options: { maxRequests: number; windowMs: number; message?: string }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (record.count >= options.maxRequests) {
      return sendError(
        res,
        options.message || 'Too many requests. Please slow down and try again shortly.',
        429
      );
    }

    record.count++;
    next();
  };
};
