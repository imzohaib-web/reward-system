'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi } from '@/lib/api';
import { getCustomerInfo, isCustomerLoggedIn } from '@/lib/auth';
import styles from '@/styles/global.module.css';

export default function PortalDashboardPage() {
  const router = useRouter();
  const customer = getCustomerInfo();
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pointsAmount, setPointsAmount] = useState('');
  const [useToken, setUseToken] = useState(false);

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      router.replace('/portal');
      return;
    }
    loadData();
  }, [router]);

  async function loadData() {
    setLoading(true);
    setMessage(null);
    try {
      const [balRes, histRes] = await Promise.all([
        customerApi.getWallet(),
        customerApi.getHistory(),
      ]);
      setBalance(balRes.data);
      setHistory(histRes.data.history);
      setPagination(histRes.data.pagination);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function usePoints(e) {
    e.preventDefault();
    const amount = Number(pointsAmount);
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid points amount.' });
      return;
    }
    setMessage(null);
    try {
      const res = await customerApi.useReward({
        rewardType: 'Points',
        amount,
        referenceId: `PORTAL-USE-${Date.now()}`,
        referenceType: 'ORDER',
        description: 'Points redeemed from customer portal',
      });
      setMessage({ type: 'success', text: `Used ${amount} points.` });
      setPointsAmount('');
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function useFreeToken() {
    setMessage(null);
    try {
      const res = await customerApi.useReward({
        rewardType: 'Free Delivery Token',
        amount: 1,
        referenceId: `PORTAL-TOKEN-${Date.now()}`,
        referenceType: 'ORDER',
        description: 'Free delivery token redeemed from customer portal',
      });
      setMessage({ type: 'success', text: 'Free delivery token used.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (loading) return <div className={styles.loadingBox}>Loading your wallet...</div>;

  return (
    <div className={styles.page}>
      <h1 style={{ fontSize: 24, margin: '24px 0 4px 0' }}>
        Welcome, {customer ? customer.name : 'Customer'}!
      </h1>
      <p style={{ color: '#6b7280', marginTop: 0 }}>
        {customer ? customer.email : ''}
      </p>

      {message && (
        <div className={message.type === 'error' ? styles.errorBox : styles.successBox}>
          {message.text}
        </div>
      )}

      {balance && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '20px 0' }}>
          <div className={styles.card} style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Points Balance</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{balance.pointsBalance ?? 0}</div>
          </div>
          <div className={styles.card} style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Free Delivery Tokens</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{balance.freeDeliveryTokens ?? 0}</div>
          </div>
          <div className={styles.card} style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Total Earned</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{balance.totalPointsEarned ?? 0} pts</div>
          </div>
          <div className={styles.card} style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Total Used</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{balance.totalPointsUsed ?? 0} pts</div>
          </div>
        </div>
      )}

      <div className={styles.card} style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, margin: '0 0 12px 0' }}>Redeem Rewards</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={usePoints} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className={styles.input}
              type="number"
              min="1"
              placeholder="Points to use"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              style={{ width: 140 }}
            />
            <button className={styles.primaryBtn} type="submit">
              Use Points
            </button>
          </form>
          <button
            className={styles.primaryBtn}
            onClick={useFreeToken}
            disabled={!(balance && balance.freeDeliveryTokens > 0)}
          >
            Use Free Delivery Token
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: 18 }}>
        Reward History ({pagination ? pagination.total : 0})
      </h2>

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
                      h.status === 'Earned' ? styles.badgeActive : styles.badgeInactive
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
        <div style={{ color: '#6b7280' }}>No rewards yet.</div>
      )}
    </div>
  );
}
