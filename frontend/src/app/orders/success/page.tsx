'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    // Clear the cart once they land on success page
    clearCart();
  }, [clearCart]);

  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', color: 'green', marginBottom: '1rem' }}>✓</div>
      <h1>Order Confirmed!</h1>
      <p style={{ margin: '1rem 0', color: 'var(--color-text-muted)' }}>
        Your payment was successful and your order has been received by the kitchen. 
      </p>
      <div style={{ marginTop: '2rem' }}>
        <Link href="/" style={{ padding: '0.8rem 1.5rem', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
          Return to Menu
        </Link>
      </div>
    </div>
  );
}
