const axios = require('axios');
const config = require('../config');

class WalletApiClient {
  constructor() {
    this.baseUrl = config.walletService.url;
    this.apiKey = config.walletService.apiKey;
  }

  _headers(extra = {}) {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...extra,
    };
  }

  async addReward({ userId, rewardType, amount, referenceId, referenceType, description, expiryDays, metadata }) {
    const response = await axios.post(
      `${this.baseUrl}/api/wallet/add`,
      {
        userId,
        rewardType,
        amount,
        referenceId,
        referenceType,
        description,
        expiryDays,
        metadata,
      },
      { headers: this._headers() }
    );
    return response.data;
  }

  async useReward({ userId, rewardType, amount, referenceId, referenceType, description }) {
    const response = await axios.post(
      `${this.baseUrl}/api/wallet/use`,
      {
        userId,
        rewardType,
        amount,
        referenceId,
        referenceType,
        description,
      },
      { headers: this._headers() }
    );
    return response.data;
  }

  async getBalance(userId) {
    const response = await axios.get(`${this.baseUrl}/api/wallet/balance`, {
      params: { userId },
      headers: this._headers(),
    });
    return response.data;
  }

  async removeReward({ userId, rewardType, amount, referenceId, referenceType, description }) {
    const response = await axios.post(
      `${this.baseUrl}/api/wallet/remove`,
      {
        userId,
        rewardType,
        amount,
        referenceId,
        referenceType,
        description,
      },
      { headers: this._headers() }
    );
    return response.data;
  }

  async getHistory(userId, options = {}) {
    const response = await axios.get(`${this.baseUrl}/api/wallet/history`, {
      params: { userId, ...options },
      headers: this._headers(),
    });
    return response.data;
  }
}

module.exports = new WalletApiClient();