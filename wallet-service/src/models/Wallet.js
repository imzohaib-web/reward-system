const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  pointsBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  freeDeliveryTokens: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalPointsEarned: {
    type: Number,
    default: 0,
  },
  totalPointsUsed: {
    type: Number,
    default: 0,
  },
  totalTokensEarned: {
    type: Number,
    default: 0,
  },
  totalTokensUsed: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Wallet', walletSchema);