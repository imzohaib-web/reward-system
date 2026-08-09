'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { rewardApi, walletApi } from '@/lib/api';
import { setRewardToken, setWalletToken } from '@/lib/auth';
import styles from '@/styles/global.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [service, setService] = useState('reward');
  const [email, setEmail] = useState('admin@rewards.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const switchService = (svc) => {
    setService(svc);
    setEmail(svc === 'reward' ? 'admin@rewards.com' : 'admin@wallet.com');
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (service === 'reward') {
        const res = await rewardApi.login(email, password);
        setRewardToken(res.data.token);
      } else {
        const res = await walletApi.login(email, password);
        setWalletToken(res.data.token);
      }
      setSuccess(`Logged in to ${service === 'reward' ? 'Reward Service' : 'Wallet Service'}`);
      setTimeout(() => router.push('/dashboard'), 400);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.centerScreen}>
      <div className={styles.card} style={{ width: 400 }}>
        <h1 style={{ fontSize: 22, margin: '0 0 4px 0' }}>Admin Login</h1>
        <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: 14 }}>
          Reward &amp; Wallet System Admin Panel
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['reward', 'wallet'].map((svc) => (
            <button
              key={svc}
              type="button"
              onClick={() => switchService(svc)}
              style={{
                flex: 1,
                padding: 8,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: 'pointer',
                background: service === svc ? '#2563eb' : '#fff',
                color: service === svc ? '#fff' : '#111827',
                fontWeight: 600,
              }}
            >
              {svc === 'reward' ? 'Reward Service' : 'Wallet Service'}
            </button>
          ))}
        </div>

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
          {success && <div className={styles.successBox}>{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className={styles.primaryBtn}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Logging in...' : `Login to ${service === 'reward' ? 'Reward Service' : 'Wallet Service'}`}
          </button>
        </form>

        <p style={{ fontSize: 14, marginTop: 16, textAlign: 'center', color: '#6b7280' }}>
          Are you a customer?{' '}
          <Link href="/portal" style={{ color: '#2563eb', fontWeight: 600 }}>
            Customer Login
          </Link>
        </p>
      </div>
    </div>
  );
}
