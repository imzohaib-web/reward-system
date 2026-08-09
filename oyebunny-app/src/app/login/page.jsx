'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        router.push('/');
      } else {
        setErrorMessage(res.message || 'Login failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error connecting to authentication service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={{ fontSize: '2.5rem' }}>🐰</span>
          <h2 style={styles.title}>Customer Login</h2>
          <p style={styles.sub}>Access your OyeBunny account & Reward Wallet</p>
        </div>

        {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <Link href="/register" style={styles.link}>
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '40px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: '8px 0 4px 0',
    color: '#1a202c',
    fontSize: '1.4rem',
  },
  sub: {
    margin: 0,
    color: '#718096',
    fontSize: '0.85rem',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    border: '1px solid #feb2b2',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4a5568',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '0.95rem',
    outline: 'none',
  },
  submitBtn: {
    backgroundColor: '#dd6b20',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: '8px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#718096',
  },
  link: {
    color: '#dd6b20',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
};
