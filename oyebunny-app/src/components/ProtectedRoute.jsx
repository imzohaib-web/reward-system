'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>🐰</div>
        <p style={styles.loadingText}>Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    fontSize: '3rem',
    animation: 'bounce 1s infinite alternate',
  },
  loadingText: {
    marginTop: '12px',
    color: '#718096',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
};
