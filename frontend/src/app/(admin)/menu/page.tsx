'use client';

import { useEffect, useState } from 'react';
import { getAdminMenu, archiveMenuItem } from '@/lib/api/menu';
import { MenuItemDto } from '@servia/shared';
import styles from './page.module.css';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await getAdminMenu();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch menu', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to archive this item?')) {
      try {
        await archiveMenuItem(id);
        fetchMenu(); // Refresh list
      } catch (err) {
        console.error('Failed to archive item', err);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Menu Management</h1>
        <button className={styles.button}>+ Add Menu Item</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Price (NGN)</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className={styles.td}>{item.name}</td>
                <td className={styles.td}>{item.category?.name || 'Uncategorized'}</td>
                <td className={styles.td}>{(item.price / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</td>
                <td className={styles.td}>
                  {item.deletedAt ? (
                    <span className={`${styles.badge} ${styles.badgeArchived}`}>Archived</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                  )}
                </td>
                <td className={styles.td}>
                  <button className={styles.actionBtn}>Edit</button>
                  {!item.deletedAt && (
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(item.id)}>
                      Archive
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
