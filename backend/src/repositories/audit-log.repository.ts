import { prisma } from '../lib/prisma';

/**
 * AuditLogRepository
 * 
 * Enforces the Append-Only constraint for Audit Logs.
 * Exposes ONLY a create method. There are intentionally no update or delete methods.
 */
export class AuditLogRepository {
  static async create(userId: string, action: string, metadata?: any) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata
      }
    });
  }
}
