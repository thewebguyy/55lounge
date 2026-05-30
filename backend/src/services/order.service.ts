import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import { env } from '../lib/env';
import { OrderStatus } from '@prisma/client';

export class OrderService {
  /**
   * Validates cart items against the database, creates a PENDING order,
   * and initializes a Paystack transaction.
   */
  static async createOrderIntent(userId: string, cartItems: { menuItemId: string, quantity: number }[]) {
    if (!cartItems || cartItems.length === 0) {
      throw new AppError('Cart cannot be empty', 400, 'EMPTY_CART');
    }

    // 1. Fetch current prices from database to prevent frontend spoofing
    const menuItemIds = cartItems.map(item => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        deletedAt: null,
        isAvailable: true
      }
    });

    if (menuItems.length !== cartItems.length) {
      throw new AppError('One or more items in your cart are unavailable', 400, 'ITEMS_UNAVAILABLE');
    }

    // 2. Calculate total and prepare order item snapshots
    let totalAmount = 0;
    const orderItemsData = cartItems.map(cartItem => {
      const dbItem = menuItems.find(mi => mi.id === cartItem.menuItemId)!;
      totalAmount += (dbItem.price * cartItem.quantity);

      return {
        menuItemId: dbItem.id,
        nameAtPurchase: dbItem.name,
        priceAtPurchase: dbItem.price,
        quantity: cartItem.quantity
      };
    });

    // 3. Create the PENDING Order in the database
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        items: {
          create: orderItemsData
        }
      }
    });

    // 4. Initialize Paystack Transaction (Server-to-Server)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        amount: totalAmount, // Paystack expects Kobo/Cents natively
        reference: order.id, // We use the Order ID as the reference for exact matching
        callback_url: `${env.FRONTEND_URL}/orders/success`,
      })
    });

    const paystackData = await paystackRes.json();
    if (!paystackRes.ok || !paystackData.status) {
      throw new AppError('Failed to initialize payment gateway', 500, 'PAYMENT_GATEWAY_ERROR');
    }

    // Return the authorization URL to the frontend for redirection
    return {
      orderId: order.id,
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference
    };
  }

  /**
   * Handles the Paystack webhook verification and fulfillment.
   */
  static async handleWebhookEvent(event: any) {
    if (event.event !== 'charge.success') return; // We only care about successful payments for now

    const reference = event.data.reference;
    
    // Find the order
    const order = await prisma.order.findUnique({ where: { id: reference } });
    if (!order) return; // Order not found, ignore

    // Idempotency and Edge Case: Ignore if already confirmed/processing, or if manually CANCELLED by operator
    if (order.status === 'CANCELLED') {
      console.warn(`Webhook received for CANCELLED Order ${order.id}. Ignoring to preserve operator cancellation.`);
      return;
    }
    if (order.status !== 'PENDING') return;

    // Verify amount matches to prevent partial payment spoofing via API
    if (order.totalAmount !== event.data.amount) {
      console.warn(`Amount mismatch for Order ${order.id}. Expected ${order.totalAmount}, got ${event.data.amount}`);
      // In a real system, you might flag this order for manual review instead of ignoring.
      return;
    }

    // Fulfill the order
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'CONFIRMED',
        paystackReference: event.data.id.toString() // Store paystack's internal transaction ID
      }
    });

    console.log(`Order ${order.id} confirmed via Paystack Webhook.`);
  }

  // Helper to fetch user's orders
  static async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Helper to fetch a single order for tracking
  static async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { menuItem: true } } }
    });
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    return order;
  }

  // --- OPERATOR FUNCTIONS ---

  static async listActiveOrders() {
    return prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PREPARING', 'READY'] }
      },
      include: { items: true, user: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async listHistoricalOrders() {
    return prisma.order.findMany({
      where: {
        status: { in: ['COMPLETED', 'CANCELLED'] }
      },
      include: { items: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateOrderStatus(id: string, newStatus: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // Terminal
      CANCELLED: []  // Terminal
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      throw new AppError(`Cannot transition from ${order.status} to ${newStatus}`, 400, 'INVALID_STATE_TRANSITION');
    }

    return prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: { items: true, user: true }
    });
  }
}
