const mongoose = require('mongoose');

const rewardRuleSchema = new mongoose.Schema({
  ruleKey: {
    type: String,
    required: true,
    unique: true,
  },
  ruleName: {
    type: String,
    required: true,
  },
  ruleType: {
    type: String,
    enum: ['REFERRAL', 'PRODUCT_REWARD', 'ORDER_MILESTONE'],
    required: true,
  },
  rewardType: {
    type: String,
    enum: ['Points', 'Free Delivery Token'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  condition: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  expiryDays: {
    type: Number,
    required: true,
    default: 45,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  description: {
    type: String,
  },
  isDynamic: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('RewardRule', rewardRuleSchema);