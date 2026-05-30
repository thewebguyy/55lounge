import request from 'supertest';
import { createApp } from './app';
import { prisma } from './lib/prisma';

const app = createApp();

jest.mock('./lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe('GET /api/v1/health', () => {
  it('should return 200 OK when database is connected', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ '?column?': 1 }]);

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        database: 'connected',
      })
    );
  });

  it('should return 503 Service Unavailable when database is disconnected', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'degraded',
        database: 'disconnected',
      })
    );
  });
});
