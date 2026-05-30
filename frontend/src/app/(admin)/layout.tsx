'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'OPERATOR')) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) return null;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>55Lounge Admin</div>
        <Link href="/admin/menu" className={styles.navLink}>Menu Management</Link>
        <Link href="/admin/orders" className={styles.navLink}>Orders</Link>
        <Link href="/admin/reservations" className={styles.navLink}>Reservations</Link>
        <button 
          onClick={() => { clearAuth(); router.push('/login'); }} 
          className={styles.navLink} 
          style={{ background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          Logout
        </button>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
