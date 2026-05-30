import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/AppError';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res, next) => {
    next(new AppError('Too many requests from this IP, please try again later.', 429, 'RATE_LIMIT_EXCEEDED'));
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs (prevents brute force)
  handler: (req, res, next) => {
    next(new AppError('Too many authentication attempts, please try again after 15 minutes.', 429, 'RATE_LIMIT_EXCEEDED'));
  },
  standardHeaders: true,
  legacyHeaders: false,
});
