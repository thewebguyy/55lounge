'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderTracking } from '@/lib/api/order';
import { useAuthStore } from '@/lib/auth';
import styles from './page.module.css';

const STATUS_STAGES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchTracking();
    const interval = setInterval(fetchTracking, 15000); // 15s polling per ADR-0006
    return () => clearInterval(interval);
  }, [id, isAuthenticated, router]);

  const fetchTracking = async () => {
    try {
      const res = await getOrderTracking(id as string);
      if (res.success) {
        setOrder(res.data);
      } else {
        setError(res.error?.message || 'Failed to fetch tracking data');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <div className={styles.container}><h3>{error}</h3></div>;
  if (!order) return <div className={styles.container}>Loading order status...</div>;

  const currentStageIndex = STATUS_STAGES.indexOf(order.status);
  
  const getStatusMessage = () => {
    switch(order.status) {
      case 'PENDING': return 'Waiting for payment confirmation...';
      case 'CONFIRMED': return 'Order received! The kitchen will start soon.';
      case 'PREPARING': return 'The chef is preparing your meal.';
      case 'READY': return 'Your order is ready to be served/picked up!';
      case 'COMPLETED': return 'Enjoy your meal!';
      case 'CANCELLED': return 'This order was cancelled.';
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Track Your Order</h1>
        <div className={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</div>
      </div>

      <div className={styles.statusCard} data-status={order.status}>
        <div className={styles.statusText}>{order.status}</div>
        <div className={styles.statusDesc}>{getStatusMessage()}</div>

        {order.status !== 'CANCELLED' && (
          <div className={styles.timeline}>
            {STATUS_STAGES.map((stage, index) => (
              <div 
                key={stage} 
                className={styles.timelineDot} 
                data-active={index <= currentStageIndex}
              >
                {index <= currentStageIndex && '✓'}
                <div className={styles.timelineLabel}>{stage}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Order Details</h3>
        {order.items.map((item: any) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>{item.quantity}x {item.nameAtPurchase}</span>
          </div>
        ))}
        <hr style={{ margin: '1rem 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Total Paid</span>
          <span>{(order.totalAmount / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</span>
        </div>
      </div>
    </div>
  );
}
