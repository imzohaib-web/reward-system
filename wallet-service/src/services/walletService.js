const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const RewardHistory = require('../models/RewardHistory');
const AppError = require('../utils/AppError');

class WalletService {
  async getOrCreateWallet(userId) {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }
    return wallet;
  }

  // Consume from earned reward entries (FIFO) and update their remaining amount
  async _consumeEarnedRewards(userId, rewardType, amount, consumedStatus = 'Used') {
    const earned = await RewardHistory.find({
      userId,
      rewardType,
      status: 'Earned',
      isActive: true,
      remainingAmount: { $gt: 0 },
      expiryDate: { $gt: new Date() },
    }).sort({ earnedAt: 1 });

    let toConsume = amount;
    for (const entry of earned) {
      if (toConsume <= 0) break;
      const available = entry.remainingAmount;
      const consumed = Math.min(available, toConsume);
      entry.remainingAmount -= consumed;
      if (entry.remainingAmount <= 0) {
        entry.status = consumedStatus;
        if (consumedStatus === 'Reversed') entry.reversedAt = new Date();
        else entry.usedAt = new Date();
        entry.isActive = false;
      }
      await entry.save();
      toConsume -= consumed;
    }

    if (toConsume > 0) {
      throw new AppError('Insufficient unexpired reward units to consume', 422);
    }
  }

  async addReward(data) {
    const {
      userId,
      rewardType,
      amount,
      referenceId,
      referenceType,
      description,
      expiryDays = 45,
      metadata = {},
    } = data;

    const wallet = await this.getOrCreateWallet(userId);

    let balanceBefore, balanceAfter;
    let walletUpdate = {};
    let transactionType;

    if (rewardType === 'Points') {
      balanceBefore = wallet.pointsBalance;
      balanceAfter = balanceBefore + amount;
      walletUpdate = {
        pointsBalance: balanceAfter,
        totalPointsEarned: wallet.totalPointsEarned + amount,
      };
      transactionType = 'EARN_POINTS';
    } else {
      balanceBefore = wallet.freeDeliveryTokens;
      balanceAfter = balanceBefore + amount;
      walletUpdate = {
        freeDeliveryTokens: balanceAfter,
        totalTokensEarned: wallet.totalTokensEarned + amount,
      };
      transactionType = 'EARN_TOKEN';
    }

    try {
      const updatedWallet = await Wallet.findByIdAndUpdate(
        wallet._id,
        walletUpdate,
        { returnDocument: 'after' }
      );

      const transaction = await WalletTransaction.create({
        userId,
        walletId: wallet._id,
        transactionType,
        rewardType,
        amount,
        balanceBefore,
        balanceAfter,
        referenceId,
        referenceType,
        description,
        status: 'COMPLETED',
        metadata,
      });

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      await RewardHistory.create({
        userId,
        walletTransactionId: transaction._id,
        rewardType,
        amount,
        status: 'Earned',
        earnedAt: new Date(),
        expiryDate,
        referenceId,
        referenceType,
        description,
        isActive: true,
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    } catch (error) {
      // Manual rollback if wallet update happened but transaction/history failed
      await Wallet.findByIdAndUpdate(
        wallet._id,
        { $set: { pointsBalance: wallet.pointsBalance, freeDeliveryTokens: wallet.freeDeliveryTokens } },
        { returnDocument: 'after' }
      );
      throw error;
    }
  }

  async useReward(data) {
    const {
      userId,
      rewardType,
      amount,
      referenceId,
      referenceType,
      description,
    } = data;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    let balanceBefore, balanceAfter;
    let walletUpdate = {};
    let transactionType;

    if (rewardType === 'Points') {
      balanceBefore = wallet.pointsBalance;
      if (balanceBefore < amount) {
        throw new AppError('Insufficient points balance', 422);
      }
      balanceAfter = balanceBefore - amount;
      walletUpdate = {
        pointsBalance: balanceAfter,
        totalPointsUsed: wallet.totalPointsUsed + amount,
      };
      transactionType = 'USE_POINTS';
    } else {
      balanceBefore = wallet.freeDeliveryTokens;
      if (balanceBefore < amount) {
        throw new AppError('Insufficient free delivery tokens', 422);
      }
      balanceAfter = balanceBefore - amount;
      walletUpdate = {
        freeDeliveryTokens: balanceAfter,
        totalTokensUsed: wallet.totalTokensUsed + amount,
      };
      transactionType = 'USE_TOKEN';
    }

    // Consume from earned reward entries (FIFO) so expired rewards are never consumed
    await this._consumeEarnedRewards(userId, rewardType, amount);

    try {
      const updatedWallet = await Wallet.findByIdAndUpdate(
        wallet._id,
        walletUpdate,
        { returnDocument: 'after' }
      );

      const transaction = await WalletTransaction.create({
        userId,
        walletId: wallet._id,
        transactionType,
        rewardType,
        amount,
        balanceBefore,
        balanceAfter,
        referenceId,
        referenceType,
        description,
        status: 'COMPLETED',
      });

      await RewardHistory.create({
        userId,
        walletTransactionId: transaction._id,
        rewardType,
        amount,
        status: 'Used',
        usedAt: new Date(),
        referenceId,
        referenceType,
        description,
        isActive: true,
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    } catch (error) {
      // Manual rollback
      await Wallet.findByIdAndUpdate(
        wallet._id,
        { $set: { pointsBalance: wallet.pointsBalance, freeDeliveryTokens: wallet.freeDeliveryTokens } },
        { returnDocument: 'after' }
      );
      throw error;
    }
  }

  async removeReward(data) {
    const {
      userId,
      rewardType,
      amount,
      referenceId,
      referenceType,
      description,
    } = data;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    let balanceBefore, balanceAfter;
    let walletUpdate = {};

    if (rewardType === 'Points') {
      balanceBefore = wallet.pointsBalance;
      if (balanceBefore < amount) {
        throw new AppError('Insufficient points balance', 422);
      }
      balanceAfter = balanceBefore - amount;
      walletUpdate = {
        pointsBalance: balanceAfter,
      };
    } else {
      balanceBefore = wallet.freeDeliveryTokens;
      if (balanceBefore < amount) {
        throw new AppError('Insufficient free delivery tokens', 422);
      }
      balanceAfter = balanceBefore - amount;
      walletUpdate = {
        freeDeliveryTokens: balanceAfter,
      };
    }

    // Consume from earned reward entries (FIFO) for reversal
    await this._consumeEarnedRewards(userId, rewardType, amount, 'Reversed');

    try {
      const updatedWallet = await Wallet.findByIdAndUpdate(
        wallet._id,
        walletUpdate,
        { returnDocument: 'after' }
      );

      const transaction = await WalletTransaction.create({
        userId,
        walletId: wallet._id,
        transactionType: 'REMOVE_REWARD',
        rewardType,
        amount,
        balanceBefore,
        balanceAfter,
        referenceId,
        referenceType,
        description,
        status: 'COMPLETED',
      });

      await RewardHistory.create({
        userId,
        walletTransactionId: transaction._id,
        rewardType,
        amount,
        status: 'Reversed',
        reversedAt: new Date(),
        referenceId,
        referenceType,
        description,
        isActive: true,
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    } catch (error) {
      // Manual rollback
      await Wallet.findByIdAndUpdate(
        wallet._id,
        { $set: { pointsBalance: wallet.pointsBalance, freeDeliveryTokens: wallet.freeDeliveryTokens } },
        { returnDocument: 'after' }
      );
      throw error;
    }
  }

  async getHistory(userId, options = {}) {
    const { page = 1, limit = 20, status, rewardType, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const query = { userId };

    if (status) query.status = status;
    if (rewardType) query.rewardType = rewardType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [history, total] = await Promise.all([
      RewardHistory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RewardHistory.countDocuments(query),
    ]);

    return {
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBalance(userId) {
    const wallet = await Wallet.findOne({ userId }).lean();
    if (!wallet) {
      return {
        pointsBalance: 0,
        freeDeliveryTokens: 0,
        totalPointsEarned: 0,
        totalPointsUsed: 0,
        totalTokensEarned: 0,
        totalTokensUsed: 0,
      };
    }
    return {
      pointsBalance: wallet.pointsBalance,
      freeDeliveryTokens: wallet.freeDeliveryTokens,
      totalPointsEarned: wallet.totalPointsEarned,
      totalPointsUsed: wallet.totalPointsUsed,
      totalTokensEarned: wallet.totalTokensEarned,
      totalTokensUsed: wallet.totalTokensUsed,
    };
  }

  async expireRewards() {
    const now = new Date();
    const expiredRewards = await RewardHistory.find({
      status: 'Earned',
      expiryDate: { $lt: now },
      isActive: true,
      remainingAmount: { $gt: 0 },
    });

    let expiredCount = 0;

    for (const reward of expiredRewards) {
      try {
        const wallet = await Wallet.findOne({ userId: reward.userId });
        if (!wallet) continue;

        const expiredAmount = reward.remainingAmount;

        let balanceBefore, balanceAfter;
        let walletUpdate = {};

        if (reward.rewardType === 'Points') {
          balanceBefore = wallet.pointsBalance;
          balanceAfter = Math.max(0, balanceBefore - expiredAmount);
          walletUpdate = { pointsBalance: balanceAfter };
        } else {
          balanceBefore = wallet.freeDeliveryTokens;
          balanceAfter = Math.max(0, balanceBefore - expiredAmount);
          walletUpdate = { freeDeliveryTokens: balanceAfter };
        }

        await Wallet.findByIdAndUpdate(wallet._id, walletUpdate, { returnDocument: 'after' });

        await WalletTransaction.create({
          userId: reward.userId,
          walletId: wallet._id,
          transactionType: 'EXPIRE_REWARD',
          rewardType: reward.rewardType,
          amount: expiredAmount,
          balanceBefore,
          balanceAfter,
          referenceId: reward.referenceId,
          referenceType: 'EXPIRY',
          description: 'Reward expired after 45 days',
          status: 'COMPLETED',
        });

        reward.status = 'Expired';
        reward.expiredAt = new Date();
        reward.isActive = false;
        await reward.save();

        expiredCount++;
      } catch (error) {
        console.error(`Error expiring reward ${reward._id}:`, error.message);
      }
    }

    return { expiredCount };
  }
}

module.exports = new WalletService();
