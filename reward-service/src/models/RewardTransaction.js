const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  rewardType: {
    type: String,
    enum: ['Points', 'Free Delivery Token'],
    required: true,
  },
  ruleKey: {
    type: String,
    required: true,
  },
  ruleType: {
    type: String,
    enum: ['REFERRAL', 'PRODUCT_REWARD', 'ORDER_MILESTONE'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    enum: ['ORDER', 'REFERRAL'],
    required: true,
  },
  walletTransactionId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVOKED'],
    default: 'PENDING',
  },
  orderDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  error: {
    type: String,
  },
}, {
  timestamps: true,
});

rewardTransactionSchema.index({ orderId: 1, ruleKey: 1 }, { unique: true });
rewardTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RewardTransaction', rewardTransactionSchema);