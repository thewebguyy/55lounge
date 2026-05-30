import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './lib/env';
import { logger } from './lib/logger';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware';

export const createApp = () => {
  const app = express();

  // Request ID
  app.use(requestIdMiddleware);

  // Logging
  app.use(pinoHttp({
    logger,
    customProps: (req) => {
      // Access the id appended by requestIdMiddleware
      return { reqId: (req as express.Request).id };
    },
    autoLogging: {
      ignore: (req) => req.url === '/api/v1/health'
    }
  }));

  // Security Middlewares
  app.use(helmet());
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  }));

  // Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/v1', routes);

  // 404 Catch-All
  app.use(notFoundMiddleware);

  // Global Error Handler
  app.use(errorMiddleware);

  return app;
};
