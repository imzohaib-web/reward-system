'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await register(formData);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMessage(res.message || 'Registration failed');
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
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.sub}>Register for OyeBunny & start earning reward points</p>
        </div>

        {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="03001234567"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" style={styles.link}>
            Sign In Here
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
    paddingTop: '30px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '32px',
    width: '100%',
    maxWidth: '440px',
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
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4a5568',
  },
  input: {
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '0.9rem',
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
    marginTop: '10px',
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
