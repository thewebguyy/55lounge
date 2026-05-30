import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ url: env.DATABASE_URL });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
