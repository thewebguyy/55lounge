import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  // M4: Paystack payment integration
  PAYSTACK_SECRET_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  // M6: Reservation slot capacity
  MAX_CAPACITY_PER_SLOT: z.string().default('20'),
  // M8: Sentry error tracking (optional — safe to omit in development)
  SENTRY_DSN: z.string().optional()
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  return parsed.data;
};

export const env = parseEnv();
