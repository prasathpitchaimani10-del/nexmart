import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/authService';
import { sendError } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token missing or invalid format.', 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = AuthService.verifyToken(token);

  if (!payload) {
    return sendError(res, 'Session expired or invalid authentication token.', 401);
  }

  req.user = payload;
  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = AuthService.verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
};
