'use client';

import { useEffect, useState } from 'react';
import { getActiveOrders, updateOrderStatus } from '@/lib/api/admin-orders';
import styles from './page.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // 15s polling per ADR-0006
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getActiveOrders();
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch active orders', err);
    }
  };

  const advanceOrder = async (id: string, currentStatus: string) => {
    const transitions: Record<string, string> = {
      'CONFIRMED': 'PREPARING',
      'PREPARING': 'READY',
      'READY': 'COMPLETED'
    };
    const nextStatus = transitions[currentStatus];
    if (!nextStatus) return;

    try {
      await updateOrderStatus(id, nextStatus);
      fetchOrders();
    } catch (err: any) {
      alert('Failed to advance order: ' + err.message);
    }
  };

  const cancelOrder = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await updateOrderStatus(id, 'CANCELLED');
      fetchOrders();
    } catch (err: any) {
      alert('Failed to cancel order: ' + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Active Orders</h1>
      </div>

      <div className={styles.grid}>
        {orders.length === 0 ? (
          <p>No active orders.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className={styles.orderCard} data-status={order.status}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
                <span className={styles.time}>{new Date(order.createdAt).toLocaleTimeString()}</span>
              </div>
              
              <div>
                <strong>Status:</strong> {order.status}
              </div>

              <div className={styles.itemsList}>
                {order.items.map((item: any) => (
                  <div key={item.id} className={styles.item}>
                    <span>{item.quantity}x {item.nameAtPurchase}</span>
                  </div>
                ))}
              </div>

              <div className={styles.total}>
                {(order.totalAmount / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
              </div>

              <div className={styles.actions}>
                {order.status !== 'READY' && (
                  <button className={styles.btnCancel} onClick={() => cancelOrder(order.id)}>Cancel</button>
                )}
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`} 
                  onClick={() => advanceOrder(order.id, order.status)}
                >
                  {order.status === 'CONFIRMED' ? 'Start Preparing' : 
                   order.status === 'PREPARING' ? 'Mark Ready' : 'Complete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
