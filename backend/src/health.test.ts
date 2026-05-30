import request from 'supertest';
import { createApp } from './app';
import { prisma } from './lib/prisma';

const app = createApp();

describe('Health Check Endpoint', () => {
  beforeEach(() => {
    jest.spyOn(prisma, '$queryRaw').mockResolvedValue([1]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 OK without authentication', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
    expect(res.body.environment).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });
});
