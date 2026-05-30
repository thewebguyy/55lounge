import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';

export class MenuService {
  // --- CATEGORIES ---
  static async listCategories() {
    return prisma.category.findMany({
      orderBy: { order: 'asc' }
    });
  }

  static async createCategory(name: string, slug: string, order?: number) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Category slug already exists', 400, 'CATEGORY_EXISTS');
    }

    return prisma.category.create({
      data: { name, slug, order: order || 0 }
    });
  }

  static async updateCategory(id: string, data: { name?: string; slug?: string; order?: number }) {
    return prisma.category.update({
      where: { id },
      data
    });
  }

  // --- MENU ITEMS ---
  static async listPublicMenuItems() {
    // Public catalog only sees available, non-deleted items
    return prisma.menuItem.findMany({
      where: {
        deletedAt: null,
        isAvailable: true
      },
      include: { category: true }
    });
  }

  static async listAdminMenuItems() {
    // Admin catalog sees all items, including deleted
    return prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: string;
    isAvailable?: boolean;
  }) {
    return prisma.menuItem.create({
      data
    });
  }

  static async updateMenuItem(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    categoryId: string;
    isAvailable: boolean;
  }>) {
    return prisma.menuItem.update({
      where: { id },
      data
    });
  }

  static async deleteMenuItem(id: string) {
    // Soft delete implementation
    return prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
