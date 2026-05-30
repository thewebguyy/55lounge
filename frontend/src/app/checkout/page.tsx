'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart';
import { createOrderIntent } from '@/lib/api/order';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handlePayment = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      const payload = items.map(i => ({ menuItemId: i.menuItem.id, quantity: i.quantity }));
      const res = await createOrderIntent(payload);

      if (res.success && res.data) {
        // Redirect to Paystack
        window.location.href = res.data.authorizationUrl;
      } else {
        alert('Failed to initialize payment: ' + (res.error?.message || 'Unknown error'));
        setIsProcessing(false);
      }
    } catch (err) {
      alert('An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Checkout</h1>
      <div style={{ margin: '2rem 0', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Order Summary</h3>
        {items.map(item => (
          <div key={item.menuItem.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>{item.quantity}x {item.menuItem.name}</span>
            <span>{((item.menuItem.price * item.quantity) / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</span>
          </div>
        ))}
        <hr style={{ margin: '1rem 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
          <span>Total</span>
          <span>{(getTotal() / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</span>
        </div>
      </div>

      <button 
        onClick={handlePayment} 
        disabled={isProcessing || items.length === 0}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          cursor: isProcessing ? 'not-allowed' : 'pointer'
        }}
      >
        {isProcessing ? 'Initializing Payment...' : 'Pay with Paystack'}
      </button>
    </div>
  );
}
