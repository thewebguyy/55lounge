import express, { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Webhook endpoint MUST use express.raw to preserve exact payload for HMAC signature
// It must also be mounted BEFORE any global express.json() if it's placed in the main app tree.
// Since our main app.ts uses app.use(express.json()) globally, we must override it here.
router.post('/webhook', express.raw({ type: 'application/json' }), orderController.paystackWebhook);

// Protected routes
router.use(requireAuth);
// Ensure JSON parsing for protected routes since they might be bypassed by raw above
router.use(express.json());

router.post('/intent', orderController.createIntent);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderTracking);

export default router;
