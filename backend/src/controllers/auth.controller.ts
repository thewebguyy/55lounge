import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { env } from '../lib/env';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.register(email, password);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No refresh token provided' } });
      return;
    }

    const { accessToken, refreshToken } = await AuthService.refresh(oldRefreshToken);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ success: true, data: { accessToken } });
  } catch (err) {
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as any).user || {}; // handled by auth middleware ideally, or decoded from existing access token
    if (userId) {
      await AuthService.logout(userId);
    }
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
