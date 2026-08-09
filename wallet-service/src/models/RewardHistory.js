const mongoose = require('mongoose');

const rewardHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  walletTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
    required: true,
  },
  rewardType: {
    type: String,
    enum: ['Points', 'Free Delivery Token'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  remainingAmount: {
    type: Number,
    default: function () { return this.amount; },
  },
  status: {
    type: String,
    enum: ['Earned', 'Used', 'Expired', 'Reversed'],
    required: true,
  },
  earnedAt: {
    type: Date,
  },
  usedAt: {
    type: Date,
  },
  expiredAt: {
    type: Date,
  },
  reversedAt: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  referenceId: {
    type: String,
    required: true,
  },
  referenceType: {
    type: String,
    enum: ['ORDER', 'REFERRAL', 'PRODUCT_REWARD', 'ORDER_MILESTONE', 'MANUAL', 'EXPIRY', 'REVERSAL'],
    required: true,
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

rewardHistorySchema.index({ userId: 1, createdAt: -1 });
rewardHistorySchema.index({ referenceId: 1, referenceType: 1 });
rewardHistorySchema.index({ status: 1, expiryDate: 1 });

module.exports = mongoose.model('RewardHistory', rewardHistorySchema);