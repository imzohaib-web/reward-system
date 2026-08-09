import { apiRequest } from './apiClient';

const WALLET_URL = process.env.NEXT_PUBLIC_WALLET_SERVICE_URL || 'http://localhost:5002';

export const walletService = {
  async getWallet() {
    return apiRequest(`${WALLET_URL}/api/customer/wallet`, {
      method: 'GET',
    });
  },

  async getHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `${WALLET_URL}/api/customer/history?${queryString}`
      : `${WALLET_URL}/api/customer/history`;

    return apiRequest(url, {
      method: 'GET',
    });
  },

  async useReward(payload) {
    return apiRequest(`${WALLET_URL}/api/customer/use`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
