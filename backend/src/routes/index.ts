import { Router } from 'express';
import authRoute from './auth.route';
import menuRoute from './menu.route';
import adminRoute from './admin.route';
import orderRoute from './order.route';
import reservationRoute from './reservation.route';

const router = Router();

router.use('/auth', authRoute);
router.use('/menu', menuRoute);
router.use('/admin', adminRoute);
router.use('/orders', orderRoute);
router.use('/reservations', reservationRoute);

export default router;
