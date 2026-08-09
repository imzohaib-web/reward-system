const mongoose = require('mongoose');

const referralRecordSchema = new mongoose.Schema({
  referrerUserId: {
    type: String,
    required: true,
    index: true,
  },
  referredUserId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  referralCode: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'REWARDED', 'FAILED'],
    default: 'PENDING',
  },
  rewardedOrderId: {
    type: String,
  },
  rewardAmount: {
    type: Number,
  },
  rewardGivenAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ReferralRecord', referralRecordSchema);