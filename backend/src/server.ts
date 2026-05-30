import { createApp } from './app';
import { env } from './lib/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: env.SENTRY_DSN || '',
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

async function startServer() {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Unified Graceful Shutdown
  const shutdown = async (reason: string, isError = false) => {
    logger.info(`Shutdown initiated. Reason: ${reason}`);
    
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        await prisma.$disconnect();
        logger.info('Database disconnected');
      } catch (err) {
        logger.error({ err }, 'Error during database disconnect');
      }

      try {
        await Sentry.close(2000);
        logger.info('Sentry flushed');
      } catch (err) {
        logger.error({ err }, 'Error during Sentry flush');
      }

      logger.info('Shutdown complete. Exiting process.');
      process.exit(isError ? 1 : 0);
    });

    // Fallback if shutdown takes too long
    setTimeout(() => {
      logger.error('Forcefully exiting after 10 seconds');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err: Error) => {
    logger.error({ err }, 'UNCAUGHT EXCEPTION — shutting down');
    Sentry.captureException(err);
    shutdown('uncaughtException', true);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error({ reason }, 'UNHANDLED REJECTION — shutting down');
    Sentry.captureException(reason);
    shutdown('unhandledRejection', true);
  });
}

startServer().catch((err) => {
  // If the server fails to start entirely (e.g. port in use, env misconfiguration),
  // we capture to Sentry, log, and exit. Graceful shutdown is not possible here
  // because the server handle may not exist.
  console.error('Fatal: failed to start server', err);
  Sentry.captureException(err);
  process.exit(1);
});
