'use client';

import { useEffect, useState } from 'react';
import { getDashboardAnalytics } from '@/lib/api/analytics';
import styles from './page.module.css';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');

  useEffect(() => {
    fetchMetrics(timeframe);
  }, [timeframe]);

  const fetchMetrics = async (tf: string) => {
    let start, end;
    const now = new Date();
    
    if (tf === 'TODAY') {
      start = new Date(now.setHours(0,0,0,0)).toISOString();
      end = new Date(now.setHours(23,59,59,999)).toISOString();
    } else if (tf === 'WEEK') {
      const pastWeek = new Date(now);
      pastWeek.setDate(pastWeek.getDate() - 7);
      start = pastWeek.toISOString();
    } else if (tf === 'MONTH') {
      const pastMonth = new Date(now);
      pastMonth.setMonth(pastMonth.getMonth() - 1);
      start = pastMonth.toISOString();
    }

    const res = await getDashboardAnalytics(start, end);
    if (res.success) {
      setMetrics(res.data);
    }
  };

  if (!metrics) return <div>Loading dashboard...</div>;

  const maxSold = metrics.popularItems.length > 0 
    ? Math.max(...metrics.popularItems.map((i: any) => i.totalSold)) 
    : 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Analytics Dashboard</h1>
        <div className={styles.filters}>
          {['TODAY', 'WEEK', 'MONTH', 'ALL'].map((tf) => (
            <button 
              key={tf}
              className={styles.btnFilter} 
              data-active={timeframe === tf}
              onClick={() => setTimeframe(tf as any)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Total Revenue</div>
          <div className={styles.metricValue}>
            {(metrics.totalRevenue / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Completed Orders</div>
          <div className={styles.metricValue}>{metrics.totalOrders}</div>
        </div>
      </div>

      <div className={styles.chartCard}>
        <h2>Top 5 Popular Items</h2>
        <div className={styles.barList}>
          {metrics.popularItems.length === 0 ? <p>No data for this period.</p> : metrics.popularItems.map((item: any) => (
            <div key={item.name} className={styles.barRow}>
              <div className={styles.barLabel} title={item.name}>{item.name}</div>
              <div className={styles.barTrack}>
                <div 
                  className={styles.barFill} 
                  style={{ width: `${Math.max((item.totalSold / maxSold) * 100, 5)}%` }}
                >
                  {item.totalSold} sold
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
