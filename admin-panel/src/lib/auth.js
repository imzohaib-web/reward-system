const TOKEN_KEY_REWARD = 'admin_token_reward';
const TOKEN_KEY_WALLET = 'admin_token_wallet';
const TOKEN_KEY_CUSTOMER = 'customer_token';
const CUSTOMER_KEY = 'customer_info';

export function getRewardToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY_REWARD);
}

export function getWalletToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY_WALLET);
}

export function setRewardToken(token) {
  if (typeof window !== 'undefined') {
    if (token) window.localStorage.setItem(TOKEN_KEY_REWARD, token);
    else window.localStorage.removeItem(TOKEN_KEY_REWARD);
  }
}

export function setWalletToken(token) {
  if (typeof window !== 'undefined') {
    if (token) window.localStorage.setItem(TOKEN_KEY_WALLET, token);
    else window.localStorage.removeItem(TOKEN_KEY_WALLET);
  }
}

export function clearAllTokens() {
  setRewardToken(null);
  setWalletToken(null);
  setCustomerToken(null);
}

export function isLoggedIn() {
  return Boolean(getRewardToken());
}

export function getCustomerToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY_CUSTOMER);
}

export function setCustomerToken(token) {
  if (typeof window !== 'undefined') {
    if (token) window.localStorage.setItem(TOKEN_KEY_CUSTOMER, token);
    else window.localStorage.removeItem(TOKEN_KEY_CUSTOMER);
  }
}

export function getCustomerInfo() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(CUSTOMER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCustomerInfo(info) {
  if (typeof window !== 'undefined') {
    if (info) window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(info));
    else window.localStorage.removeItem(CUSTOMER_KEY);
  }
}

export function isCustomerLoggedIn() {
  return Boolean(getCustomerToken());
}
