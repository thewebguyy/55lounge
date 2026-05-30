import { Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from './auth.middleware';
import { AppError } from '../errors/AppError';
import { env } from '../lib/env';
const jsonwebtoken = require('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = { headers: {} };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('requireAuth', () => {
    it('should throw UNAUTHORIZED if no auth header', () => {
      requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].code).toBe('UNAUTHORIZED');
    });

    it('should throw INVALID_TOKEN if token is malformed', () => {
      mockRequest.headers = { authorization: 'Bearer invalid_token_xyz' };
      requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].code).toBe('INVALID_TOKEN');
    });

    it('should populate req.user if token is valid', () => {
      const validToken = jsonwebtoken.sign({ userId: '123', role: 'ADMIN' }, env.JWT_SECRET);
      mockRequest.headers = { authorization: `Bearer ${validToken}` };

      requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(); // called without error
      expect((mockRequest as Request).user).toEqual({ userId: '123', role: 'ADMIN' });
    });
  });

  describe('requireRole', () => {
    it('should throw UNAUTHORIZED if req.user is undefined', () => {
      const middleware = requireRole(['ADMIN']);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].code).toBe('UNAUTHORIZED');
    });

    it('should throw FORBIDDEN if user role is not allowed', () => {
      mockRequest.user = { userId: '123', role: 'CUSTOMER' };
      const middleware = requireRole(['ADMIN', 'OPERATOR']);
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect((nextFunction as jest.Mock).mock.calls[0][0].code).toBe('FORBIDDEN');
    });

    it('should call next if user role is allowed', () => {
      mockRequest.user = { userId: '123', role: 'OPERATOR' };
      const middleware = requireRole(['ADMIN', 'OPERATOR']);
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(); // called without error
    });
  });
});
