'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useWallet } from '@/context/WalletContext';
import { walletService } from '@/services/walletService';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function WalletPage() {
  const {
    pointsBalance,
    freeDeliveryTokens,
    discountEquivalentRupees,
    refreshWallet,
  } = useWallet();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await walletService.getHistory();
      if (res && res.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Failed to load transaction history:', err);
      setErrorMsg(err.message || 'Could not fetch transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWallet();
    loadHistory();
  }, [refreshWallet]);

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link href="/" style={styles.backLink}>
            ← Back to Food Menu
          </Link>
          <h1 style={styles.title}>⭐ My Reward Wallet & History</h1>
        </div>

        {/* Balance Cards */}
        <div style={styles.balanceGrid}>
          {/* Points Card */}
          <div style={styles.pointsCard}>
            <div style={styles.cardHeader}>
              <span>Reward Points Balance</span>
              <span style={{ fontSize: '1.5rem' }}>⭐</span>
            </div>
            <div style={styles.ptsVal}>{pointsBalance} Pts</div>
            <div style={styles.ptsSub}>
              Cash Value: <strong>{formatCurrency(discountEquivalentRupees)}</strong> (Conversion: 2 Points = Rs. 1)
            </div>
          </div>

          {/* Tokens Card */}
          <div style={styles.tokensCard}>
            <div style={styles.cardHeader}>
              <span>Free Delivery Tokens</span>
              <span style={{ fontSize: '1.5rem' }}>🎟️</span>
            </div>
            <div style={styles.tokenVal}>{freeDeliveryTokens} Tokens</div>
            <div style={styles.ptsSub}>
              Earned every 10 completed orders!
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <h3 style={{ margin: 0, color: '#2d3748' }}>Transaction History</h3>
            <button onClick={loadHistory} style={styles.refreshBtn}>
              🔄 Refresh Ledger
            </button>
          </div>

          {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

          {loading ? (
            <div style={styles.loadingBox}>Loading transaction history...</div>
          ) : transactions.length === 0 ? (
            <div style={styles.emptyBox}>
              <span style={{ fontSize: '2rem' }}>📜</span>
              <p style={{ margin: '8px 0 0 0', color: '#718096' }}>
                No reward transactions recorded yet. Complete an order to earn points!
              </p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date & Time</th>
                    <th style={styles.th}>Transaction Type</th>
                    <th style={styles.th}>Reward Type</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Balance After</th>
                    <th style={styles.th}>Reference ID</th>
                    <th style={styles.th}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isEarn =
                      tx.transactionType === 'EARN_POINTS' ||
                      tx.transactionType === 'EARN_TOKEN';
                    return (
                      <tr key={tx._id || tx.id} style={styles.tr}>
                        <td style={styles.td}>{formatDate(tx.createdAt)}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.txBadge,
                              backgroundColor: isEarn ? '#e6fffa' : '#fff5f5',
                              color: isEarn ? '#234e52' : '#9b2c2c',
                            }}
                          >
                            {tx.transactionType}
                          </span>
                        </td>
                        <td style={styles.td}>{tx.rewardType}</td>
                        <td
                          style={{
                            ...styles.td,
                            fontWeight: 'bold',
                            color: isEarn ? '#2f855a' : '#c53030',
                          }}
                        >
                          {isEarn ? `+${tx.amount}` : `-${tx.amount}`}
                        </td>
                        <td style={styles.td}>
                          {tx.balanceAfter !== undefined ? tx.balanceAfter : 'N/A'}
                        </td>
                        <td style={styles.td}>
                          <code style={styles.refCode}>{tx.referenceId || 'N/A'}</code>
                        </td>
                        <td style={{ ...styles.td, fontSize: '0.8rem', color: '#718096' }}>
                          {tx.description || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  backLink: {
    color: '#dd6b20',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  title: {
    margin: 0,
    fontSize: '1.6rem',
    color: '#2d3748',
  },
  balanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  pointsCard: {
    backgroundColor: '#fffaf0',
    border: '1px solid #feebc8',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  tokensCard: {
    backgroundColor: '#ebf8ff',
    border: '1px solid #bee3f8',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: '8px',
  },
  ptsVal: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#c05621',
    marginBottom: '4px',
  },
  tokenVal: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginBottom: '4px',
  },
  ptsSub: {
    fontSize: '0.8rem',
    color: '#718096',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #edf2f7',
    paddingBottom: '12px',
  },
  refreshBtn: {
    background: 'none',
    border: '1px solid #cbd5e0',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#4a5568',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    border: '1px solid #feb2b2',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '12px',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '30px',
    color: '#718096',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '40px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    backgroundColor: '#f7fafc',
    color: '#4a5568',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid #edf2f7',
  },
  td: {
    padding: '12px',
    color: '#2d3748',
  },
  txBadge: {
    fontSize: '0.7rem',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  refCode: {
    fontFamily: 'monospace',
    backgroundColor: '#f7fafc',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
  },
};
