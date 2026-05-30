import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

// Extend Express Request interface to include 'id'
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
