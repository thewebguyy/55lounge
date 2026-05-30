'use client';

import { useCartStore } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import styles from './CartDrawer.module.css';
import { useAuthStore } from '@/lib/auth';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please log in to checkout.');
      router.push('/login');
    } else {
      router.push('/checkout');
    }
    onClose();
  };

  return (
    <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
      <div className={styles.header}>
        <h2>Your Order</h2>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
      </div>

      <div className={styles.itemsList}>
        {items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div key={item.menuItem.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <h4>{item.menuItem.name}</h4>
                <div className={styles.itemPrice}>
                  {(item.menuItem.price / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                </div>
              </div>
              <div className={styles.quantityControls}>
                <button className={styles.qtyBtn} onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button className={styles.qtyBtn} onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}>+</button>
                <button className={styles.qtyBtn} onClick={() => removeItem(item.menuItem.id)}>x</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          <span>Total:</span>
          <span>{(getTotal() / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</span>
        </div>
        <button 
          className={styles.checkoutBtn} 
          disabled={items.length === 0}
          onClick={handleCheckout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
