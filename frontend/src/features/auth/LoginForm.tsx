'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import styles from './LoginForm.module.css';
import { LoginResponse } from '@servia/shared';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important to set the refresh cookie
      });

      const data: LoginResponse = await res.json();

      if (res.ok && data.success && data.data) {
        setAuth(data.data.user, data.data.accessToken);
        // Route to dashboard or home based on role
        if (data.data.user.role === 'ADMIN' || data.data.user.role === 'OPERATOR') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error?.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Sign In</h2>
      
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input 
          id="email"
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className={styles.input}
          required 
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="password">Password</label>
        <input 
          id="password"
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className={styles.input}
          required 
        />
      </div>

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
