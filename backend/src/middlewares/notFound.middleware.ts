import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND', true));
};
