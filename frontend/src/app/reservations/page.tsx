'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { createReservation, getMyReservations } from '@/lib/api/reservations';
import styles from './page.module.css';

export default function ReservationsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00'); // Default to 6 PM
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Only run top-of-hour slots (18:00 to 22:00)
  const availableSlots = ['18:00', '19:00', '20:00', '21:00', '22:00'];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchHistory();
  }, [isAuthenticated, router]);

  const fetchHistory = async () => {
    const res = await getMyReservations();
    if (res.success) setHistory(res.data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!date) {
      setError('Please select a date.');
      setIsSubmitting(false);
      return;
    }

    const dateTimeString = `${date}T${time}:00.000Z`;

    try {
      const res = await createReservation(dateTimeString, partySize, specialRequests);
      
      if (res.success) {
        alert('Reservation confirmed!');
        fetchHistory();
        setDate('');
        setSpecialRequests('');
      } else {
        // Handle 409 Conflict elegantly per ADR-0007
        if (res.error?.code === 'CONCURRENCY_CONFLICT' || res.error?.code === 'CAPACITY_EXCEEDED') {
          setError(`Sorry, that slot just filled up. Only limited seats remain. Please try another time.`);
        } else {
          setError(res.error?.message || 'Failed to make reservation');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Book a Table</h2>
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Date</label>
            <input 
              type="date" 
              className={styles.input} 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Time Slot</label>
            <select className={styles.select} value={time} onChange={e => setTime(e.target.value)}>
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Party Size</label>
            <input 
              type="number" 
              className={styles.input} 
              value={partySize} 
              onChange={e => setPartySize(parseInt(e.target.value))} 
              min={1} 
              max={20}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Special Requests (Optional)</label>
            <textarea 
              className={styles.input} 
              value={specialRequests} 
              onChange={e => setSpecialRequests(e.target.value)}
              rows={3}
            />
          </div>

          <button type="submit" className={styles.btn} disabled={isSubmitting}>
            {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <h2>Your Reservations</h2>
        <div className={styles.history}>
          {history.length === 0 ? <p>No past reservations.</p> : history.map(res => (
            <div key={res.id} className={styles.historyCard}>
              <div>
                <strong>{new Date(res.reservationTime).toLocaleDateString()} at {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                <div>Party of {res.partySize}</div>
              </div>
              <span className={`${styles.statusBadge} ${styles[`badge${res.status}`] || ''}`}>
                {res.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
