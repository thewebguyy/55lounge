import { Router } from 'express';
import authRoute from './auth.route';
import menuRoute from './menu.route';
import adminRoute from './admin.route';

const router = Router();

router.use('/auth', authRoute);
router.use('/menu', menuRoute);
router.use('/admin', adminRoute);

export default router;
