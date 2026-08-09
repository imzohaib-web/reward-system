'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletService } from '@/services/walletService';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWallet = useCallback(async () => {
    if (!isAuthenticated) {
      setWallet(null);
      setHistory([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await walletService.getWallet();
      if (res && res.data) {
        setWallet(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await walletService.getHistory();
      if (res && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load wallet transaction history:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
      fetchHistory();
    }
  }, [isAuthenticated, fetchWallet, fetchHistory]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        history,
        loading,
        error,
        pointsBalance: wallet ? wallet.pointsBalance : 0,
        freeDeliveryTokens: wallet ? wallet.freeDeliveryTokens : 0,
        discountEquivalentRupees: wallet ? (wallet.pointsBalance / 2) : 0, // 2 Points = Rs 1
        refreshWallet: fetchWallet,
        refreshHistory: fetchHistory,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
