export const config = {
  authApi: process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:5000',
  rewardApi: process.env.NEXT_PUBLIC_REWARD_API || 'http://localhost:5001',
  walletApi: process.env.NEXT_PUBLIC_WALLET_API || 'http://localhost:5002',
};
