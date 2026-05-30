import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jwt-rs'; // using jsonwebtoken, but type is jwt
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { AppError } from '../errors/AppError';

// Using actual jsonwebtoken
const jsonwebtoken = require('jsonwebtoken');

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export class AuthService {
  private static generateTokens(userId: string, role: UserRole) {
    const payload: JwtPayload = { userId, role };
    
    const accessToken = jsonwebtoken.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    return { accessToken, refreshToken };
  }

  static async register(email: string, password: string, role: UserRole = 'CUSTOMER') {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email is already registered', 400, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      }
    });

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.role);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken }
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken
    };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.role);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken }
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken
    };
  }

  static async refresh(token: string) {
    let decoded: any;
    try {
      decoded = jsonwebtoken.verify(token, env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.refreshToken) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    const isMatch = await bcrypt.compare(token, user.refreshToken);
    if (!isMatch) {
      // Possible token theft / reuse scenario
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } });
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user.id, user.role);
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken }
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
  }
}
