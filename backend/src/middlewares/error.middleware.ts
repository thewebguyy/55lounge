import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import * as Sentry from '@sentry/node';
import { logger } from '../lib/logger';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isOperational = err instanceof AppError ? err.isOperational : false;
  
  if (!isOperational) {
    // Unexpected infrastructure error — send to Sentry and log at error level.
    // isOperational === false means this is NOT a controlled AppError;
    // it is an unhandled exception that warrants an alert.
    Sentry.captureException(err);
    logger.error({ err, reqId: req.id }, 'Unexpected Infrastructure Error');
  } else {
    // Controlled operational error (4xx). Do NOT send to Sentry.
    logger.warn({ err: err.message, code: (err as AppError).code, reqId: req.id }, 'Operational Error');
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = isOperational ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
};
