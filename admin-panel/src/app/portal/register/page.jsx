'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { setCustomerToken, setCustomerInfo } from '@/lib/auth';
import styles from '@/styles/global.module.css';

export default function PortalRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register(name, email, password, phone || undefined);
      setCustomerToken(res.data.token);
      setCustomerInfo(res.data.customer);
      router.push('/portal/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.centerScreen}>
      <div className={styles.card} style={{ width: 420 }}>
        <h1 style={{ fontSize: 22, margin: '0 0 4px 0' }}>Create Account</h1>
        <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: 14 }}>
          Register to start earning rewards.
        </p>

        <form onSubmit={handleRegister}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>
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
            <label className={styles.label}>Phone (optional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              minLength={6}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={styles.input}
              minLength={6}
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
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ fontSize: 14, marginTop: 16, textAlign: 'center', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link href="/portal" style={{ color: '#0f766e', fontWeight: 600 }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
