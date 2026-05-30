import { AuthService } from './auth.service';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and generate tokens', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_password');
      
      const mockUser = { id: 'user-1', email: 'test@example.com', role: 'CUSTOMER' };
      (prisma.user.create as jest.Mock).mockResolvedValueOnce(mockUser);
      
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');
        
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_refresh_token');
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({});

      const result = await AuthService.register('test@example.com', 'password123');

      expect(result).toEqual({
        user: { id: 'user-1', email: 'test@example.com', role: 'CUSTOMER' },
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed_password',
          role: 'CUSTOMER'
        }
      });
    });

    it('should throw AppError if email is already registered', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'user-1' });

      await expect(
        AuthService.register('test@example.com', 'password123')
      ).rejects.toThrow(AppError);
      
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should authenticate user and return tokens', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', passwordHash: 'hashed_password', role: 'CUSTOMER' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');
        
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_refresh_token');
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({});

      const result = await AuthService.login('test@example.com', 'password123');

      expect(result).toEqual({
        user: { id: 'user-1', email: 'test@example.com', role: 'CUSTOMER' },
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      });
    });

    it('should throw AppError for invalid credentials if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        AuthService.login('test@example.com', 'password123')
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError if passwords do not match', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', passwordHash: 'hashed_password', role: 'CUSTOMER' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        AuthService.login('test@example.com', 'password123')
      ).rejects.toThrow(AppError);
    });
  });

  describe('refresh', () => {
    it('should verify refresh token and generate new tokens', async () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce({ userId: 'user-1' });
      
      const mockUser = { id: 'user-1', role: 'CUSTOMER', refreshToken: 'hashed_old_refresh_token' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('new_access_token')
        .mockReturnValueOnce('new_refresh_token');
        
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_new_refresh_token');
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({});

      const result = await AuthService.refresh('old_refresh_token');

      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token'
      });
    });

    it('should throw AppError if token verification fails', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('invalid token');
      });

      await expect(
        AuthService.refresh('invalid_token')
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError and clear refresh token if compare fails (reuse detection)', async () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce({ userId: 'user-1' });
      
      const mockUser = { id: 'user-1', role: 'CUSTOMER', refreshToken: 'hashed_old_refresh_token' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({});

      await expect(
        AuthService.refresh('stolen_refresh_token')
      ).rejects.toThrow(AppError);
      
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { refreshToken: null }
      });
    });
  });

  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({});

      await AuthService.logout('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { refreshToken: null }
      });
    });
  });
});
