import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';
import { config } from '../../config';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(config.isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // Unhandled errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(config.isDevelopment && { stack: err.stack }),
  });
};
