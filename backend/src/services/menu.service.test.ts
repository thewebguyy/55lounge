import { MenuService } from './menu.service';
import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';

jest.mock('../lib/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    menuItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('MenuService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Categories', () => {
    it('should list categories ordered by order field', async () => {
      const mockCategories = [{ id: '1', name: 'Drinks', slug: 'drinks', order: 1 }];
      (prisma.category.findMany as jest.Mock).mockResolvedValueOnce(mockCategories);

      const result = await MenuService.listCategories();
      expect(result).toEqual(mockCategories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { order: 'asc' },
      });
    });

    it('should create a category if slug is unique', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const mockCategory = { id: '1', name: 'Drinks', slug: 'drinks', order: 1 };
      (prisma.category.create as jest.Mock).mockResolvedValueOnce(mockCategory);

      const result = await MenuService.createCategory('Drinks', 'drinks', 1);
      expect(result).toEqual(mockCategory);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({ where: { slug: 'drinks' } });
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Drinks', slug: 'drinks', order: 1 },
      });
    });

    it('should throw AppError when creating a category with an existing slug', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1', slug: 'drinks' });

      await expect(
        MenuService.createCategory('Drinks', 'drinks', 1)
      ).rejects.toThrow(AppError);
      expect(prisma.category.create).not.toHaveBeenCalled();
    });

    it('should update a category', async () => {
      const mockCategory = { id: '1', name: 'Drinks Updated', slug: 'drinks-updated', order: 2 };
      (prisma.category.update as jest.Mock).mockResolvedValueOnce(mockCategory);

      const result = await MenuService.updateCategory('1', { name: 'Drinks Updated', order: 2 });
      expect(result).toEqual(mockCategory);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Drinks Updated', order: 2 },
      });
    });
  });

  describe('Menu Items', () => {
    it('should list public menu items (only active, non-deleted)', async () => {
      const mockItems = [{ id: '1', name: 'Burger', deletedAt: null, isAvailable: true }];
      (prisma.menuItem.findMany as jest.Mock).mockResolvedValueOnce(mockItems);

      const result = await MenuService.listPublicMenuItems();
      expect(result).toEqual(mockItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, isAvailable: true },
        include: { category: true },
      });
    });

    it('should list admin menu items (all items including deleted)', async () => {
      const mockItems = [{ id: '1', name: 'Burger', deletedAt: new Date(), isAvailable: false }];
      (prisma.menuItem.findMany as jest.Mock).mockResolvedValueOnce(mockItems);

      const result = await MenuService.listAdminMenuItems();
      expect(result).toEqual(mockItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should create a menu item', async () => {
      const mockItem = { id: '1', name: 'Burger', price: 1000, categoryId: 'cat-1' };
      (prisma.menuItem.create as jest.Mock).mockResolvedValueOnce(mockItem);

      const result = await MenuService.createMenuItem({
        name: 'Burger',
        price: 1000,
        categoryId: 'cat-1',
      });
      expect(result).toEqual(mockItem);
      expect(prisma.menuItem.create).toHaveBeenCalledWith({
        data: { name: 'Burger', price: 1000, categoryId: 'cat-1' },
      });
    });

    it('should update a menu item', async () => {
      const mockItem = { id: '1', name: 'Burger Updated', price: 1200 };
      (prisma.menuItem.update as jest.Mock).mockResolvedValueOnce(mockItem);

      const result = await MenuService.updateMenuItem('1', { name: 'Burger Updated', price: 1200 });
      expect(result).toEqual(mockItem);
      expect(prisma.menuItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Burger Updated', price: 1200 },
      });
    });

    it('should soft delete a menu item by setting deletedAt', async () => {
      const mockItem = { id: '1', name: 'Burger', deletedAt: new Date() };
      (prisma.menuItem.update as jest.Mock).mockResolvedValueOnce(mockItem);

      const result = await MenuService.deleteMenuItem('1');
      expect(result.deletedAt).toBeDefined();
      expect(prisma.menuItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
