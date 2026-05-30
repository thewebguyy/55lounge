import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './lib/env';
import { logger } from './lib/logger';
import routes from './routes';
import healthRoute from './routes/health.route';
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

  // Body & Cookie Parsing
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/v1/orders/webhook')) {
      next(); // skip json parsing for webhook
    } else {
      express.json()(req, res, next);
    }
  });
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health Check
  app.use('/health', healthRoute);

  // API Routes
  app.use('/api/v1', routes);

  // 404 Catch-All
  app.use(notFoundMiddleware);

  // Global Error Handler
  app.use(errorMiddleware);

  return app;
};
