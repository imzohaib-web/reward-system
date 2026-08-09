'use client';

import { useEffect, useState } from 'react';
import { rewardApi, walletApi } from '@/lib/api';
import { getRewardToken, getWalletToken } from '@/lib/auth';
import styles from '@/styles/global.module.css';

export default function DashboardPage() {
  const [status, setStatus] = useState({
    rewardLoggedIn: false,
    walletLoggedIn: false,
    rewardMe: null,
    walletMe: null,
    ruleCount: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const hasRewardToken = Boolean(getRewardToken());
      const hasWalletToken = Boolean(getWalletToken());
      let rewardMe = null;
      let walletMe = null;
      let ruleCount = null;

      if (hasRewardToken) {
        try {
          rewardMe = (await rewardApi.me()).data;
          const rules = await rewardApi.getRules();
          ruleCount = rules.count;
        } catch (e) {
          // token expired -> ignore
        }
      }

      if (hasWalletToken) {
        try {
          walletMe = (await walletApi.me()).data;
        } catch (e) {
          // token expired -> ignore
        }
      }

      setStatus({
        rewardLoggedIn: Boolean(rewardMe),
        walletLoggedIn: Boolean(walletMe),
        rewardMe,
        walletMe,
        ruleCount,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className={styles.loadingBox}>Loading dashboard...</div>;

  return (
    <div className={styles.page}>
      <h1 style={{ fontSize: 24, margin: '24px 0 8px 0' }}>Dashboard</h1>
      <p style={{ color: '#6b7280', marginTop: 0 }}>
        Overview of the Reward and Wallet microservices.
      </p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 24 }}>
        <div className={styles.card} style={{ flex: 1, minWidth: 280 }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Reward Service</h2>
          <p style={{ fontSize: 14 }}>
            {status.rewardLoggedIn ? (
              <>
                Logged in as <strong>{status.rewardMe.name}</strong> ({status.rewardMe.email})
              </>
            ) : (
              'Not logged in.'
            )}
          </p>
          <p style={{ fontSize: 14 }}>
            Active reward rules:{' '}
            {status.ruleCount !== null ? <strong>{status.ruleCount}</strong> : '-'}
          </p>
        </div>

        <div className={styles.card} style={{ flex: 1, minWidth: 280 }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Wallet Service</h2>
          <p style={{ fontSize: 14 }}>
            {status.walletLoggedIn ? (
              <>
                Logged in as <strong>{status.walletMe.name}</strong> ({status.walletMe.email})
              </>
            ) : (
              'Not logged in.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
