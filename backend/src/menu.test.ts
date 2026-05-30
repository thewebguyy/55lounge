import request from 'supertest';
import { createApp } from './app';
import { prisma } from './lib/prisma';
const jsonwebtoken = require('jsonwebtoken');
import { env } from './lib/env';

const app = createApp();

jest.mock('./lib/prisma', () => ({
  prisma: {
    menuItem: {
      findMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    }
  },
}));

describe('Menu Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/menu (Public)', () => {
    it('should query only active, non-deleted items', async () => {
      (prisma.menuItem.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.category.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/v1/menu');

      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          isAvailable: true
        },
        include: { category: true }
      });
    });
  });

  describe('GET /api/v1/admin/menu (Protected)', () => {
    it('should query all items including deleted when accessed by OPERATOR', async () => {
      const validToken = jsonwebtoken.sign({ userId: '123', role: 'OPERATOR' }, env.JWT_SECRET);

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/v1/admin/menu')
        .set('Authorization', `Bearer ${validToken}`);

      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return 403 FORBIDDEN when accessed by CUSTOMER', async () => {
      const customerToken = jsonwebtoken.sign({ userId: '456', role: 'CUSTOMER' }, env.JWT_SECRET);

      const response = await request(app)
        .get('/api/v1/admin/menu')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(prisma.menuItem.findMany).not.toHaveBeenCalled();
    });
  });
});
