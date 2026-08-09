'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { walletApi } from '@/lib/api';
import { isLoggedIn, getWalletToken } from '@/lib/auth';
import styles from '@/styles/global.module.css';

export default function WalletPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) return router.replace('/');
    if (!getWalletToken()) return router.replace('/');
  }, [router]);

  async function search() {
    if (!userId) {
      setMessage({ type: 'error', text: 'Enter a user ID to view the wallet.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const [balRes, histRes] = await Promise.all([
        walletApi.getBalance(userId),
        walletApi.getHistory(userId, {
          status: statusFilter || undefined,
          rewardType: typeFilter || undefined,
        }),
      ]);
      setBalance(balRes.data);
      setHistory(histRes.data.history);
      setPagination(histRes.data.pagination);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
      setBalance(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 style={{ fontSize: 24, margin: '24px 0 8px 0' }}>Wallet View</h1>
      <p style={{ color: '#6b7280', marginTop: 0 }}>
        Search a customer wallet to view balance, reward history, and transactions.
      </p>

      {message && (
        <div className={message.type === 'error' ? styles.errorBox : styles.successBox}>
          {message.text}
        </div>
      )}

      <div
        className={styles.card}
        style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}
      >
        <input
          className={styles.input}
          placeholder="Customer User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className={styles.input}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 130 }}
        >
          <option value="">All status</option>
          <option value="Earned">Earned</option>
          <option value="Used">Used</option>
          <option value="Expired">Expired</option>
          <option value="Reversed">Reversed</option>
        </select>
        <select
          className={styles.input}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ width: 160 }}
        >
          <option value="">All reward types</option>
          <option value="Points">Points</option>
          <option value="Free Delivery Token">Free Delivery Token</option>
        </select>
        <button className={styles.primaryBtn} onClick={search} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {balance && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
          <div className={styles.card} style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Points Balance</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{balance.pointsBalance ?? 0}</div>
          </div>
          <div className={styles.card} style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Free Delivery Tokens</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{balance.freeDeliveryTokens ?? 0}</div>
          </div>
          <div className={styles.card} style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Total Points Earned</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{balance.totalPointsEarned ?? 0}</div>
          </div>
          <div className={styles.card} style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Total Points Used</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{balance.totalPointsUsed ?? 0}</div>
          </div>
        </div>
      )}

      {pagination && (
        <h2 style={{ fontSize: 18, marginTop: 0 }}>
          Reward &amp; Transaction History ({pagination.total})
        </h2>
      )}

      {history.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Remaining</th>
              <th>Status</th>
              <th>Reference</th>
              <th>Earned At</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h._id}>
                <td>{h.rewardType}</td>
                <td>{h.amount}</td>
                <td>{h.remainingAmount ?? '-'}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      h.status === 'Earned'
                        ? styles.badgeActive
                        : h.status === 'Used'
                        ? ''
                        : styles.badgeInactive
                    }`}
                  >
                    {h.status}
                  </span>
                </td>
                <td>{h.referenceId}</td>
                <td>{h.earnedAt ? new Date(h.earnedAt).toLocaleString() : '-'}</td>
                <td>{h.expiryDate ? new Date(h.expiryDate).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        pagination && (
          <div className={styles.loadingBox} style={{ padding: 0, textAlign: 'left' }}>
            No history found for this user.
          </div>
        )
      )}
    </div>
  );
}