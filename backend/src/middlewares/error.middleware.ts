import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../lib/logger';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isOperational = err instanceof AppError ? err.isOperational : false;
  
  if (!isOperational) {
    // Log unexpected infrastructure errors as 'error'
    logger.error({ err, reqId: req.id }, 'Unexpected Infrastructure Error');
  } else {
    // Log expected operational errors as 'warn'
    logger.warn({ err: err.message, code: (err as AppError).code, reqId: req.id }, 'Operational Error');
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = isOperational ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      code,
      message,
      requestId: req.id
    }
  });
};
