import { Request, Response, NextFunction } from 'express';
import { MenuService } from '../services/menu.service';

export const getPublicMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await MenuService.listPublicMenuItems();
    const categories = await MenuService.listCategories();
    
    res.status(200).json({ success: true, data: { items, categories } });
  } catch (err) {
    next(err);
  }
};

export const getAdminMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await MenuService.listAdminMenuItems();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic validation could be expanded with Zod
    const item = await MenuService.createMenuItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await MenuService.updateMenuItem(id, req.body);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const archiveMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await MenuService.deleteMenuItem(id);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// Category handlers
export const getAdminCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await MenuService.listCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, order } = req.body;
    const category = await MenuService.createCategory(name, slug, order);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};
