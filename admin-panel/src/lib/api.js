import { config } from './config';
import { getRewardToken, getWalletToken, getCustomerToken } from './auth';

async function request(base, path, options = {}) {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const rewardApi = {
  base: config.rewardApi,

  login(email, password) {
    return request(this.base, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    const token = getRewardToken();
    return request(this.base, '/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getRules() {
    const token = getRewardToken();
    return request(this.base, '/api/reward/rules', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateRule(ruleKey, updates) {
    const token = getRewardToken();
    return request(this.base, `/api/reward/rules/${ruleKey}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
  },
};

export const walletApi = {
  base: config.walletApi,

  login(email, password) {
    return request(this.base, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    const token = getWalletToken();
    return request(this.base, '/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getBalance(userId) {
    const token = getWalletToken();
    return request(this.base, `/api/wallet/balance?userId=${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getHistory(userId, params = {}) {
    const token = getWalletToken();
    const qs = new URLSearchParams({ userId, ...params }).toString();
    return request(this.base, `/api/wallet/history?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  triggerExpiry() {
    const token = getWalletToken();
    return request(this.base, '/api/wallet/expire', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export const authApi = {
  base: config.authApi,

  register(name, email, password, phone) {
    return request(this.base, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
  },

  login(email, password) {
    return request(this.base, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    const token = getCustomerToken();
    return request(this.base, '/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export const customerApi = {
  base: config.walletApi,

  getWallet() {
    const token = getCustomerToken();
    return request(this.base, '/api/customer/wallet', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getHistory(params = {}) {
    const token = getCustomerToken();
    const qs = new URLSearchParams(params).toString();
    return request(this.base, `/api/customer/history?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  useReward(body) {
    const token = getCustomerToken();
    return request(this.base, '/api/customer/use', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  },
};
