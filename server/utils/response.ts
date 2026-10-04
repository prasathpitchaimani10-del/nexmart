import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  meta?: Record<string, any>;
}

export const sendSuccess = <T>(
  res: Response,
  message = 'Operation completed successfully',
  data?: T,
  statusCode = 200,
  meta?: Record<string, any>
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  });
};

export const sendError = (
  res: Response,
  message = 'An error occurred',
  statusCode = 400,
  errors: any[] = []
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
