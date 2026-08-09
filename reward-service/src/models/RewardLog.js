const mongoose = require('mongoose');

const rewardLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'ORDER_REWARD_CALCULATED',
      'ORDER_REWARD_IGNORED',
      'ORDER_REWARD_DUPLICATE',
      'REFERRAL_REWARD_GRANTED',
      'REFERRAL_REWARD_IGNORED',
      'REFERRAL_REWARD_FAILED',
      'WALLET_API_CALL',
      'WALLET_API_SUCCESS',
      'WALLET_API_FAILURE',
      'RULE_UPDATED',
    ],
    required: true,
  },
  userId: {
    type: String,
  },
  orderId: {
    type: String,
  },
  ruleKey: {
    type: String,
  },
  message: {
    type: String,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
    default: 'INFO',
  },
}, {
  timestamps: true,
});

rewardLogSchema.index({ userId: 1, createdAt: -1 });
rewardLogSchema.index({ eventType: 1, createdAt: -1 });

module.exports = mongoose.model('RewardLog', rewardLogSchema);