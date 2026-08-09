const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['EARN_POINTS', 'USE_POINTS', 'EARN_TOKEN', 'USE_TOKEN', 'REMOVE_REWARD', 'EXPIRE_REWARD', 'REVERSE_REWARD'],
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
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
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
  status: {
    type: String,
    enum: ['COMPLETED', 'FAILED', 'PENDING'],
    default: 'COMPLETED',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ referenceId: 1, referenceType: 1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);