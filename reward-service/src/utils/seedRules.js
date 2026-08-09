const RewardRule = require('../models/RewardRule');

const defaultRules = [
  {
    ruleKey: 'REFERRAL_REWARD',
    ruleName: 'Referral Reward',
    ruleType: 'REFERRAL',
    rewardType: 'Points',
    value: 100,
    condition: {
      minProducts: 0,
    },
    expiryDays: 45,
    status: 'Active',
    description: 'Reward given to referrer only after referred user\'s first order is completed successfully',
  },
  {
    ruleKey: 'PRODUCT_REWARD_3',
    ruleName: '3 Different Products Reward',
    ruleType: 'PRODUCT_REWARD',
    rewardType: 'Points',
    value: 20,
    condition: {
      minDistinctProducts: 3,
    },
    expiryDays: 45,
    status: 'Active',
    description: 'Reward given when customer buys 3 different products in a single order',
  },
  {
    ruleKey: 'FREE_DELIVERY_10',
    ruleName: 'Free Delivery Token (10 Completed Orders)',
    ruleType: 'ORDER_MILESTONE',
    rewardType: 'Free Delivery Token',
    value: 1,
    condition: {
      completedOrders: 10,
    },
    expiryDays: 45,
    status: 'Active',
    description: '1 Free Delivery Token after every 10 successful completed orders',
  },
];

const seedDefaultRules = async () => {
  let seededCount = 0;
  for (const rule of defaultRules) {
    const exists = await RewardRule.findOne({ ruleKey: rule.ruleKey });
    if (!exists) {
      await RewardRule.create(rule);
      seededCount++;
    }
  }
  if (seededCount > 0) {
    console.log(`Seeded ${seededCount} default reward rules`);
  }
};

module.exports = seedDefaultRules;