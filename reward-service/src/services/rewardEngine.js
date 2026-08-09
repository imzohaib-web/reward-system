const RewardRule = require('../models/RewardRule');
const RewardTransaction = require('../models/RewardTransaction');
const ReferralRecord = require('../models/ReferralRecord');
const RewardLog = require('../models/RewardLog');

class RewardEngineService {
  getDistinctProductsCount(orderItems = []) {
    if (!Array.isArray(orderItems) || orderItems.length === 0) return 0;
    const distinctProducts = new Set();
    orderItems.forEach((item) => {
      const productId = item && (item.productId || item.product_id || item.id);
      if (productId) distinctProducts.add(String(productId));
    });
    return distinctProducts.size;
  }

  async getActiveRule(ruleKey) {
    return RewardRule.findOne({ ruleKey, status: 'Active' });
  }

  async getCompletedOrderCount(userId) {
    const docs = await RewardTransaction.find(
      { userId, source: 'ORDER', ruleKey: 'ORDER_COMPLETED' },
      { orderId: 1 }
    ).lean();
    return docs.length;
  }

  async hasRewardBeenGenerated(orderId, ruleKey) {
    return RewardTransaction.exists({ orderId, ruleKey });
  }

  async hasOrderBeenProcessed(orderId) {
    return RewardTransaction.exists({ orderId, ruleKey: 'ORDER_COMPLETED' });
  }

  async recordCompletedOrder({ orderId, userId, orderDetails }) {
    return RewardTransaction.create({
      orderId,
      userId,
      rewardType: 'Points',
      ruleKey: 'ORDER_COMPLETED',
      ruleType: 'PRODUCT_REWARD',
      amount: 0,
      source: 'ORDER',
      status: 'COMPLETED',
      orderDetails: orderDetails || {},
    });
  }

  async logRewardEvent({ eventType, userId, orderId, ruleKey, message, payload, status }) {
    await RewardLog.create({
      eventType,
      userId,
      orderId,
      ruleKey,
      message,
      payload: payload || {},
      status: status || 'INFO',
    });
  }

  async createRewardTransaction({ orderId, userId, rewardType, ruleKey, ruleType, amount, source, orderDetails }) {
    return RewardTransaction.create({
      orderId,
      userId,
      rewardType,
      ruleKey,
      ruleType,
      amount,
      source,
      status: 'COMPLETED',
      orderDetails: orderDetails || {},
    });
  }
}

module.exports = new RewardEngineService();