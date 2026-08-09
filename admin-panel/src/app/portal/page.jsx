'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { setCustomerToken, setCustomerInfo } from '@/lib/auth';
import styles from '@/styles/global.module.css';

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      setCustomerToken(res.data.token);
      setCustomerInfo(res.data.customer);
      router.push('/portal/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.centerScreen}>
      <div className={styles.card} style={{ width: 400 }}>
        <h1 style={{ fontSize: 22, margin: '0 0 4px 0' }}>Customer Login</h1>
        <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: 14 }}>
          Sign in to view your wallet and rewards.
        </p>

        <form onSubmit={handleLogin}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={styles.primaryBtn}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ fontSize: 14, marginTop: 16, textAlign: 'center', color: '#6b7280' }}>
          Don&apos;t have an account?{' '}
          <Link href="/portal/register" style={{ color: '#0f766e', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
