import { apiRequest } from './apiClient';

const REWARD_URL = process.env.NEXT_PUBLIC_REWARD_SERVICE_URL || 'http://localhost:5001';

export const rewardService = {
  async processOrder(orderPayload) {
    return apiRequest(`${REWARD_URL}/api/reward/order`, {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async registerReferral(referralPayload) {
    return apiRequest(`${REWARD_URL}/api/reward/referral`, {
      method: 'POST',
      body: JSON.stringify(referralPayload),
    });
  },
};
