import request from 'supertest';
import { createApp } from './app';
import { prisma } from './lib/prisma';

// Using the actual app, but mocking the DB to avoid real calls
const app = createApp();

describe('Rate Limiting', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 429 after 5 requests to /api/v1/auth/*', async () => {
    // Mock the auth route response so we don't hit the DB or need real credentials
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    // Make 5 requests (the limit)
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@test.com', password: 'password' });
      // Depending on the mock, it might be 401 or 400, but NOT 429
      expect(res.status).not.toBe(429);
    }

    // 6th request should hit the limit
    const resRateLimited = await request(app).post('/api/v1/auth/login').send({ email: 'test@test.com', password: 'password' });
    expect(resRateLimited.status).toBe(429);
    expect(resRateLimited.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
