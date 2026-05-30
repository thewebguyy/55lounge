import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const metrics = await AnalyticsService.getDashboardMetrics(userId, start, end);
    res.status(200).json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
};
