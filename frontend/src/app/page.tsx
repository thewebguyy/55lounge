'use client';

import { useEffect, useState } from 'react';
import { MenuItemDto } from '@servia/shared';
import { apiClient } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart';
import CartDrawer from '@/components/CartDrawer';
import styles from './page.module.css';

export default function Home() {
  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { items: cartItems, addItem } = useCartStore();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await apiClient('/menu');
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch public menu', err);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.brand}>Servia</div>
        <button className={styles.cartBtn} onClick={() => setIsDrawerOpen(true)}>
          Cart
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </button>
      </header>

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.card}>
            {/* Using a standard img tag for simplicity in V1, Next/Image can be used later */}
            <img src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Servia'} alt={item.name} className={styles.image} />
            <div className={styles.content}>
              <h3 className={styles.title}>{item.name}</h3>
              <p className={styles.description}>{item.description}</p>
              <div className={styles.footer}>
                <span className={styles.price}>
                  {(item.price / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                </span>
                <button className={styles.addBtn} onClick={() => addItem(item)}>
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </main>
  );
}
