import { Router } from 'express';
import * as menuController from '../controllers/menu.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All routes here are protected and require OPERATOR or ADMIN roles
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'OPERATOR']));

// Menu Item Management
router.get('/menu', menuController.getAdminMenu);
router.post('/menu', menuController.createMenuItem);
router.put('/menu/:id', menuController.updateMenuItem);
router.delete('/menu/:id', menuController.archiveMenuItem); // Soft delete

// Category Management
router.get('/categories', menuController.getAdminCategories);
router.post('/categories', menuController.createCategory);

export default router;
