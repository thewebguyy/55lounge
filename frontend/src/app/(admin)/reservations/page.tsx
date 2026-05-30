'use client';

import { useState, useEffect } from 'react';
import { getAdminReservations, updateReservationStatus } from '@/lib/api/reservations';
import styles from './page.module.css';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReservations();
  }, [selectedDate]);

  const fetchReservations = async () => {
    const res = await getAdminReservations(new Date(selectedDate));
    if (res.success) setReservations(res.data || []);
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (status === 'CANCELLED' && !confirm('Cancel this reservation?')) return;
    
    try {
      await updateReservationStatus(id, status);
      fetchReservations();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Reservations</h1>
        <input 
          type="date" 
          className={styles.datePicker}
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Time</th>
            <th className={styles.th}>Customer</th>
            <th className={styles.th}>Party Size</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr><td colSpan={5} className={styles.td} style={{textAlign: 'center'}}>No reservations for this date.</td></tr>
          ) : reservations.map(res => (
            <tr key={res.id}>
              <td className={styles.td}>
                {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className={styles.td}>{res.user?.email}</td>
              <td className={styles.td}>{res.partySize}</td>
              <td className={styles.td}>{res.status}</td>
              <td className={styles.td}>
                {res.status === 'CONFIRMED' && (
                  <>
                    <button className={`${styles.actionBtn} ${styles.btnComplete}`} onClick={() => handleStatusChange(res.id, 'COMPLETED')}>
                      Arrived
                    </button>
                    <button className={`${styles.actionBtn} ${styles.btnCancel}`} onClick={() => handleStatusChange(res.id, 'CANCELLED')}>
                      No-Show
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
