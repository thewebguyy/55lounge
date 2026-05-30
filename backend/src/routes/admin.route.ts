import { Router } from 'express';
import * as menuController from '../controllers/menu.controller';
import * as orderController from '../controllers/order.controller';
import * as reservationController from '../controllers/reservation.controller';
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

// Order Fulfillment
router.get('/orders/active', orderController.getAdminActiveOrders);
router.get('/orders/history', orderController.getAdminHistoricalOrders);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

// Reservations
router.get('/reservations', reservationController.getAdminReservations);
router.patch('/reservations/:id/status', reservationController.updateStatus);

export default router;
