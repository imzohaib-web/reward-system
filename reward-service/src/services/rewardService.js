const RewardEngine = require('./rewardEngine');
const walletApiClient = require('./walletApiClient');
const RewardRule = require('../models/RewardRule');
const RewardTransaction = require('../models/RewardTransaction');
const ReferralRecord = require('../models/ReferralRecord');
const AppError = require('../utils/AppError');

class RewardService {
  async processOrder(orderData) {
    const {
      orderId,
      userId,
      status,
      items = [],
      referralCode,
      referrerUserId,
      source = 'FOOD_APP',
    } = orderData;

    if (!orderId || !userId) {
      throw new AppError('orderId and userId are required', 400);
    }

    if (status !== 'COMPLETED') {
      await RewardEngine.logRewardEvent({
        eventType: 'ORDER_REWARD_IGNORED',
        userId,
        orderId,
        message: `Order status is ${status}. Rewards only generated after order is COMPLETED.`,
        payload: { status },
        status: 'INFO',
      });
      return {
        processed: false,
        reason: `Order status is ${status}. Rewards are only generated after order completion.`,
      };
    }

    const results = {
      processed: true,
      orderId,
      userId,
      source,
      rewards: [],
      ignored: [],
    };

    // --- Duplicate Order Protection: an order can only be processed once ---
    const alreadyProcessed = await RewardEngine.hasOrderBeenProcessed(orderId);
    if (alreadyProcessed) {
      await RewardEngine.logRewardEvent({
        eventType: 'ORDER_REWARD_DUPLICATE',
        userId,
        orderId,
        message: `Duplicate order request for order ${orderId}. No rewards generated.`,
        status: 'WARNING',
      });
      return {
        processed: false,
        orderId,
        reason: 'Duplicate order request. This order has already been processed for rewards.',
      };
    }

    // Record the completed order receipt so milestone counting works for every completed order
    await RewardEngine.recordCompletedOrder({ orderId, userId, orderDetails: { source } });

    // --- Product Reward: 3 different products in a single order ---
    const productRule = await RewardEngine.getActiveRule('PRODUCT_REWARD_3');
    if (productRule) {
      const distinctProducts = RewardEngine.getDistinctProductsCount(items);
      const alreadyGenerated = await RewardEngine.hasRewardBeenGenerated(orderId, productRule.ruleKey);

      if (alreadyGenerated) {
        results.ignored.push({ ruleKey: productRule.ruleKey, reason: 'Duplicate order reward prevented' });
      } else if (distinctProducts >= productRule.condition.minDistinctProducts) {
        const rewardResult = await this.grantReward({
          userId,
          rewardType: productRule.rewardType,
          amount: productRule.value,
          referenceId: orderId,
          referenceType: 'ORDER',
          ruleKey: productRule.ruleKey,
          ruleType: productRule.ruleType,
          expiryDays: productRule.expiryDays,
          description: `Reward for buying ${distinctProducts} different products in order ${orderId}`,
          source: 'ORDER',
          orderDetails: { distinctProducts, source },
        });
        results.rewards.push(rewardResult);
      } else {
        results.ignored.push({
          ruleKey: productRule.ruleKey,
          reason: `Only ${distinctProducts} distinct product(s). Required: ${productRule.condition.minDistinctProducts}`,
        });
      }
    }

    // --- Free Delivery Milestone: every 10 completed orders ---
    const milestoneRule = await RewardEngine.getActiveRule('FREE_DELIVERY_10');
    if (milestoneRule) {
      const totalCompleted = await RewardEngine.getCompletedOrderCount(userId);
      const alreadyGenerated = await RewardEngine.hasRewardBeenGenerated(orderId, milestoneRule.ruleKey);

      if (alreadyGenerated) {
        results.ignored.push({ ruleKey: milestoneRule.ruleKey, reason: 'Duplicate order reward prevented' });
      } else if (totalCompleted % milestoneRule.condition.completedOrders === 0) {
        const rewardResult = await this.grantReward({
          userId,
          rewardType: milestoneRule.rewardType,
          amount: milestoneRule.value,
          referenceId: orderId,
          referenceType: 'ORDER_MILESTONE',
          ruleKey: milestoneRule.ruleKey,
          ruleType: milestoneRule.ruleType,
          expiryDays: milestoneRule.expiryDays,
          description: `Free delivery token for completing ${totalCompleted} orders`,
          source: 'ORDER',
          orderDetails: { completedOrders: totalCompleted, source },
        });
        results.rewards.push(rewardResult);
      } else {
        results.ignored.push({
          ruleKey: milestoneRule.ruleKey,
          reason: `Completed orders so far: ${totalCompleted}/${milestoneRule.condition.completedOrders}`,
        });
      }
    }

    // --- Referral Reward: referrer gets reward after referred user's order completes ---
    const referralRule = await RewardEngine.getActiveRule('REFERRAL_REWARD');
    if (referralRule && (referralCode || referrerUserId)) {
      const referralResult = await this.processReferralReward({
        userId,
        orderId,
        referralCode,
        referrerUserId,
        referralRule,
      });
      if (referralResult) results.rewards.push(referralResult);
    }

    return results;
  }

  async grantReward({ userId, rewardType, amount, referenceId, referenceType, ruleKey, ruleType, expiryDays, description, source, orderDetails }) {
    const walletResponse = await walletApiClient.addReward({
      userId,
      rewardType,
      amount,
      referenceId,
      referenceType,
      description,
      expiryDays,
      metadata: { ruleKey, ruleType, source },
    });

    const transaction = await RewardEngine.createRewardTransaction({
      orderId: referenceId,
      userId,
      rewardType,
      ruleKey,
      ruleType,
      amount,
      source,
      orderDetails,
    });

    await RewardEngine.logRewardEvent({
      eventType: 'WALLET_API_SUCCESS',
      userId,
      orderId: referenceId,
      ruleKey,
      message: `Reward of ${amount} ${rewardType} sent to wallet for order ${referenceId}`,
      payload: { walletResponse },
      status: 'SUCCESS',
    });

    return {
      ruleKey,
      rewardType,
      amount,
      expiryDays,
      walletTransactionId: walletResponse.data.transaction._id,
      message: `${amount} ${rewardType} added to wallet`,
    };
  }

  async processReferralReward({ userId, orderId, referralCode, referrerUserId, referralRule }) {
    let referral = await ReferralRecord.findOne({ referredUserId: userId, status: 'PENDING' });

    if (!referral && referralCode) {
      referral = await ReferralRecord.findOne({ referralCode, referredUserId: userId });
    }

    if (!referral && referrerUserId) {
      referral = await ReferralRecord.findOne({ referrerUserId, referredUserId: userId });
    }

    if (!referral) {
      await RewardEngine.logRewardEvent({
        eventType: 'REFERRAL_REWARD_IGNORED',
        userId,
        orderId,
        ruleKey: referralRule.ruleKey,
        message: 'No pending referral record found for this user',
        payload: { referralCode, referrerUserId },
        status: 'INFO',
      });
      return null;
    }

    if (referral.status === 'REWARDED') {
      await RewardEngine.logRewardEvent({
        eventType: 'REFERRAL_REWARD_IGNORED',
        userId,
        orderId,
        ruleKey: referralRule.ruleKey,
        message: 'Referral already rewarded',
        status: 'WARNING',
      });
      return null;
    }

    const walletResponse = await walletApiClient.addReward({
      userId: referral.referrerUserId,
      rewardType: referralRule.rewardType,
      amount: referralRule.value,
      referenceId: orderId,
      referenceType: 'REFERRAL',
      description: `Referral reward for referred user's completed order ${orderId}`,
      expiryDays: referralRule.expiryDays,
      metadata: { ruleKey: referralRule.ruleKey, referredUserId: userId },
    });

    referral.status = 'REWARDED';
    referral.rewardedOrderId = orderId;
    referral.rewardAmount = referralRule.value;
    referral.rewardGivenAt = new Date();
    await referral.save();

    await RewardEngine.createRewardTransaction({
      orderId,
      userId: referral.referrerUserId,
      rewardType: referralRule.rewardType,
      ruleKey: referralRule.ruleKey,
      ruleType: referralRule.ruleType,
      amount: referralRule.value,
      source: 'REFERRAL',
      orderDetails: { referredUserId: userId, referralCode: referral.referralCode },
    });

    await RewardEngine.logRewardEvent({
      eventType: 'REFERRAL_REWARD_GRANTED',
      userId: referral.referrerUserId,
      orderId,
      ruleKey: referralRule.ruleKey,
      message: `Referral reward of ${referralRule.value} ${referralRule.rewardType} granted to ${referral.referrerUserId}`,
      status: 'SUCCESS',
    });

    return {
      ruleKey: referralRule.ruleKey,
      rewardType: referralRule.rewardType,
      amount: referralRule.value,
      expiryDays: referralRule.expiryDays,
      walletTransactionId: walletResponse.data.transaction._id,
      message: `${referralRule.value} ${referralRule.rewardType} added to referrer's wallet`,
    };
  }

  async getRules() {
    const rules = await RewardRule.find().sort({ ruleType: 1 }).lean();
    return rules;
  }

  async updateRule(ruleKey, updates) {
    const allowedFields = ['value', 'expiryDays', 'status', 'condition', 'description', 'ruleName', 'rewardType'];

    const rule = await RewardRule.findOne({ ruleKey });
    if (!rule) {
      throw new AppError(`Reward rule ${ruleKey} not found`, 404);
    }

    const updateData = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    if (updates.status && !['Active', 'Inactive'].includes(updates.status)) {
      throw new AppError('Status must be Active or Inactive', 400);
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError('No valid fields provided to update', 400);
    }

    const updated = await RewardRule.findOneAndUpdate(
      { ruleKey },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    await RewardEngine.logRewardEvent({
      eventType: 'RULE_UPDATED',
      ruleKey,
      message: `Reward rule ${ruleKey} updated`,
      payload: { updates: updateData },
      status: 'INFO',
    });

    return updated;
  }

  async createReferralRecord({ referrerUserId, referredUserId, referralCode }) {
    const existing = await ReferralRecord.findOne({ referredUserId });
    if (existing) {
      throw new AppError('This user has already been referred', 409);
    }
    return ReferralRecord.create({
      referrerUserId,
      referredUserId,
      referralCode,
      status: 'PENDING',
    });
  }

  async cancelOrder(cancelData) {
    const { orderId, userId, reason = 'Order Cancelled' } = cancelData;

    if (!orderId || !userId) {
      throw new AppError('orderId and userId are required', 400);
    }

    const alreadyRevoked = await RewardTransaction.exists({
      orderId,
      status: 'REVOKED',
    });

    if (alreadyRevoked) {
      await RewardEngine.logRewardEvent({
        eventType: 'ORDER_CANCELLATION_DUPLICATE',
        userId,
        orderId,
        message: `Duplicate cancellation request for order ${orderId}. Rewards already revoked.`,
        status: 'WARNING',
      });
      return {
        processed: false,
        orderId,
        reason: 'Order cancellation already processed. Rewards were previously revoked.',
      };
    }

    const transactions = await RewardTransaction.find({
      orderId,
      userId,
      status: 'COMPLETED',
      ruleKey: { $ne: 'ORDER_COMPLETED' },
    });

    if (!transactions || transactions.length === 0) {
      await RewardEngine.logRewardEvent({
        eventType: 'ORDER_CANCELLATION_NO_REWARDS',
        userId,
        orderId,
        message: `Order ${orderId} cancelled, but no active points or token rewards were found to revoke.`,
        status: 'INFO',
      });
      return {
        processed: true,
        orderId,
        revokedRewards: [],
        message: 'Order cancelled. No active reward points were associated with this order.',
      };
    }

    const revokedRewards = [];

    for (const tx of transactions) {
      try {
        const walletRes = await walletApiClient.removeReward({
          userId,
          rewardType: tx.rewardType,
          amount: tx.amount,
          referenceId: orderId,
          referenceType: 'REVERSAL',
          description: `Revocation for cancelled order ${orderId}: ${reason}`,
        });

        tx.status = 'REVOKED';
        await tx.save();

        await RewardEngine.logRewardEvent({
          eventType: 'REWARD_REVOKED',
          userId,
          orderId,
          ruleKey: tx.ruleKey,
          message: `Revoked ${tx.amount} ${tx.rewardType} from wallet for order ${orderId}`,
          payload: { walletRes },
          status: 'SUCCESS',
        });

        revokedRewards.push({
          ruleKey: tx.ruleKey,
          rewardType: tx.rewardType,
          amount: tx.amount,
          status: 'REVOKED',
        });
      } catch (err) {
        console.error(`Failed to revoke reward ${tx.ruleKey} for order ${orderId}:`, err.message);
        await RewardEngine.logRewardEvent({
          eventType: 'REWARD_REVOCATION_FAILED',
          userId,
          orderId,
          ruleKey: tx.ruleKey,
          message: `Failed to revoke reward: ${err.message}`,
          status: 'ERROR',
        });
      }
    }

    return {
      processed: true,
      orderId,
      userId,
      revokedRewards,
      message: `Order cancellation processed. ${revokedRewards.length} reward(s) revoked from wallet.`,
    };
  }
}

module.exports = new RewardService();