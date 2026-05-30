import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.LOG_LEVEL || (env.NODE_ENV === 'development' ? 'debug' : 'info'),
  redact: ['password', 'passwordHash', 'authorization', 'cookie', 'req.headers.cookie', 'req.headers.authorization'],
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
});
