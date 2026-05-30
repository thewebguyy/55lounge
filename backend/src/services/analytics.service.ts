import { prisma } from '../lib/prisma';

export class AnalyticsService {
  /**
   * Retrieves dashboard aggregate metrics.
   * NOTE: This approach of real-time Prisma aggregations will be revisited when 
   * daily order volume exceeds 10,000 or dashboard load times exceed 2 seconds.
   */
  static async getDashboardMetrics(userId: string, startDate?: Date, endDate?: Date) {
    // 1. Audit Log Generation (ADR-0008)
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'VIEWED_ANALYTICS',
        metadata: { startDate, endDate }
      }
    });

    const dateFilter = {};
    if (startDate || endDate) {
      (dateFilter as any).createdAt = {};
      if (startDate) (dateFilter as any).createdAt.gte = startDate;
      if (endDate) (dateFilter as any).createdAt.lte = endDate;
    }

    // 2. Revenue and Orders (COMPLETED only)
    const orderAggregations = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: {
        status: 'COMPLETED',
        ...dateFilter
      }
    });

    // 3. Popular Items
    // Per ADR-0001, we MUST group by nameAtPurchase, not the dynamic MenuItem relationship.
    const popularItemsAggregation = await prisma.orderItem.groupBy({
      by: ['nameAtPurchase'],
      _sum: { quantity: true },
      where: {
        order: {
          status: 'COMPLETED',
          ...dateFilter
        }
      },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 5
    });

    const popularItems = popularItemsAggregation.map(item => ({
      name: item.nameAtPurchase,
      totalSold: item._sum.quantity || 0
    }));

    return {
      totalRevenue: orderAggregations._sum.totalAmount || 0,
      totalOrders: orderAggregations._count.id || 0,
      popularItems
    };
  }
}
