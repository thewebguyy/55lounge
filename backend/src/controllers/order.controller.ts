import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { OrderService } from '../services/order.service';
import { env } from '../lib/env';
import { AppError } from '../errors/AppError';

export const createIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;
    const userId = req.user!.userId; // Assumes requireAuth middleware is present

    const intent = await OrderService.createOrderIntent(userId, items);
    res.status(200).json({ success: true, data: intent });
  } catch (err) {
    next(err);
  }
};

export const paystackWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Paystack signature verification
    const signature = req.headers['x-paystack-signature'] as string;
    if (!signature) {
      return next(new AppError('Missing signature', 400, 'WEBHOOK_ERROR'));
    }

    // Important: req.body must be raw string or buffer (provided by express.raw())
    const hash = crypto.createHmac('sha512', env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest('hex');

    if (hash !== signature) {
      return next(new AppError('Invalid signature', 400, 'WEBHOOK_ERROR'));
    }

    // Parse the raw body into JSON now that signature is verified
    const event = JSON.parse(req.body.toString());

    // Process event asynchronously without blocking Paystack's 200 OK expectation
    OrderService.handleWebhookEvent(event).catch(err => {
      console.error('Webhook processing failed:', err);
    });

    // Always return 200 OK to Paystack immediately
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const orders = await OrderService.getUserOrders(userId);
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderTracking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    
    // Security check: ensure the user tracking it is the one who placed it
    if (order.userId !== req.user!.userId && req.user!.role === 'CUSTOMER') {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getAdminActiveOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await OrderService.listActiveOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const getAdminHistoricalOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await OrderService.listHistoricalOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await OrderService.updateOrderStatus(id, status);
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
