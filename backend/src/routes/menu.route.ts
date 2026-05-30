import { Router } from 'express';
import * as menuController from '../controllers/menu.controller';

const router = Router();

// Public route: returns only active, non-deleted items
router.get('/', menuController.getPublicMenu);

export default router;
