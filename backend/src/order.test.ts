import { OrderService } from './services/order.service';
import { prisma } from './lib/prisma';
import { AppError } from './errors/AppError';

jest.mock('./lib/prisma', () => ({
  prisma: {
    menuItem: { findMany: jest.fn() },
    order: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}));

// Mock global fetch for Paystack call
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: true, data: { authorization_url: 'http://test-paystack.com', reference: 'ref123' } })
  })
) as jest.Mock;

describe('OrderService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrderIntent', () => {
    it('should calculate totalAmount using backend DB prices, ignoring frontend', async () => {
      const mockDbItems = [
        { id: 'item-1', price: 5000, name: 'Burger', isAvailable: true, deletedAt: null }
      ];
      (prisma.menuItem.findMany as jest.Mock).mockResolvedValueOnce(mockDbItems);
      (prisma.order.create as jest.Mock).mockResolvedValueOnce({ id: 'order-123' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'user-1', email: 'test@example.com' });

      // The cart quantity is 2. The DB price is 5000. 
      // Expected total: 10000.
      await OrderService.createOrderIntent('user-1', [
        { menuItemId: 'item-1', quantity: 2 }
      ]);

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          totalAmount: 10000, // Important: Computed via 5000 * 2, independent of frontend
          status: 'PENDING',
        })
      });
    });

    it('should throw ITEMS_UNAVAILABLE if an item does not exist or is deleted', async () => {
      (prisma.menuItem.findMany as jest.Mock).mockResolvedValueOnce([]); // Nothing found

      await expect(
        OrderService.createOrderIntent('user-1', [{ menuItemId: 'item-1', quantity: 1 }])
      ).rejects.toThrow(AppError);
    });
  });
});
