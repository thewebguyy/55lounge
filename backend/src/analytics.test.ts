import { AnalyticsService } from './services/analytics.service';
import { prisma } from './lib/prisma';

describe('AnalyticsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('should only aggregate COMPLETED orders for revenue', async () => {
      // Mock AuditLog
      jest.spyOn(prisma.auditLog, 'create').mockResolvedValue({} as any);

      // Mock Order Aggregate
      jest.spyOn(prisma.order, 'aggregate').mockResolvedValue({
        _sum: { totalAmount: 15000 },
        _count: { id: 3 },
        _avg: { totalAmount: 5000 },
        _min: { totalAmount: 5000 },
        _max: { totalAmount: 5000 }
      });

      // Mock OrderItem GroupBy
      jest.spyOn(prisma.orderItem, 'groupBy').mockResolvedValue([
        { nameAtPurchase: 'Signature Burger', _sum: { quantity: 10 } } as any
      ]);

      const metrics = await AnalyticsService.getDashboardMetrics('admin-1');

      // Verify the audit log was created
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'admin-1',
          action: 'VIEWED_ANALYTICS'
        })
      });

      // Verify the where clause correctly enforced COMPLETED status
      expect(prisma.order.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'COMPLETED' })
        })
      );

      // Verify popular items correctly grouped by nameAtPurchase, not MenuItem ID
      expect(prisma.orderItem.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['nameAtPurchase'],
          where: expect.objectContaining({ order: expect.objectContaining({ status: 'COMPLETED' }) })
        })
      );

      expect(metrics.totalRevenue).toBe(15000);
      expect(metrics.totalOrders).toBe(3);
      expect(metrics.popularItems[0].name).toBe('Signature Burger');
    });
  });
});
