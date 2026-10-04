import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error]', err.stack || err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const errors = err.errors || [];

  return sendError(res, message, statusCode, errors);
};
