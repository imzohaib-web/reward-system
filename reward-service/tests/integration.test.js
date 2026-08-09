const mongoose = require('mongoose');
const config = require('../src/config');

// Live services under test
const REWARD_URL = 'http://localhost:3001';
const WALLET_URL = 'http://localhost:3002';

const REWARD_KEY = config.apiSecretKey;
const WALLET_KEY = 'wallet_service_api_secret_2024';

let walletConn;

async function rewardRequest(path, method = 'GET', body = null, headers = {}) {
  const res = await fetch(REWARD_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function walletRequest(path, method = 'GET', body = null, headers = {}) {
  const res = await fetch(WALLET_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

describe('Phase 8 - Final Integration Testing (Live Services)', () => {
  const FOOD_USER = 'INT-FOOD-USER';
  const MALL_USER = 'INT-MALL-USER';
  const REFERRER = 'INT-REFERRER';
  const REFERRED = 'INT-REFERRED';
  const EXP_USER = 'INT-EXP-USER';

  const USERS = [FOOD_USER, MALL_USER, REFERRER, REFERRED, EXP_USER];

  beforeAll(async () => {
    // Connect to both databases for cleanup
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongodb.uri);
    }
    walletConn = await mongoose.createConnection(
      'mongodb://localhost:27017/wallet_db?retryWrites=false'
    );

    const RewardTransaction = require('../src/models/RewardTransaction');
    const ReferralRecord = require('../src/models/ReferralRecord');
    const RewardLog = require('../src/models/RewardLog');

    await RewardTransaction.deleteMany({ userId: { $in: USERS } });
    await ReferralRecord.deleteMany({
      $or: [
        { referrerUserId: { $in: USERS } },
        { referredUserId: { $in: USERS } },
      ],
    });
    await RewardLog.deleteMany({ userId: { $in: USERS } });

    await walletConn.collection('wallets').deleteMany({ userId: { $in: USERS } });
    await walletConn.collection('wallettransactions').deleteMany({ userId: { $in: USERS } });
    await walletConn.collection('rewardhistories').deleteMany({ userId: { $in: USERS } });
  }, 30000);

  afterAll(async () => {
    await walletConn.collection('wallets').deleteMany({ userId: { $in: USERS } });
    await walletConn.collection('wallettransactions').deleteMany({ userId: { $in: USERS } });
    await walletConn.collection('rewardhistories').deleteMany({ userId: { $in: USERS } });
    await walletConn.close();
    await mongoose.connection.close();
  }, 30000);

  describe('Authentication', () => {
    it('rejects reward API calls without credentials (401)', async () => {
      const res = await rewardRequest('/api/reward/rules');
      expect(res.status).toBe(401);
    });

    it('rejects reward API calls with wrong API key (403)', async () => {
      const res = await rewardRequest('/api/reward/rules', 'GET', null, {
        'x-api-key': 'WRONG_KEY',
      });
      expect(res.status).toBe(403);
    });

    it('rejects wallet API calls without credentials (401)', async () => {
      const res = await walletRequest('/api/wallet/balance?userId=INT-FOOD-USER');
      expect(res.status).toBe(401);
    });

    it('rejects wallet API calls with wrong API key (403)', async () => {
      const res = await walletRequest('/api/wallet/balance?userId=INT-FOOD-USER', 'GET', null, {
        'x-api-key': 'WRONG_KEY',
      });
      expect(res.status).toBe(403);
    });

    it('accepts valid API key for reward service', async () => {
      const res = await rewardRequest('/api/reward/rules', 'GET', null, {
        'x-api-key': REWARD_KEY,
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Food App Simulation -> Reward Service -> Wallet Service', () => {
    it('grants 20 points for a completed order with 3 distinct products', async () => {
      const res = await rewardRequest('/api/reward/order', 'POST', {
        orderId: 'FOOD-ORD-1',
        userId: FOOD_USER,
        status: 'COMPLETED',
        items: [
          { productId: 'f1' },
          { productId: 'f2' },
          { productId: 'f3' },
        ],
        source: 'FOOD_APP',
      }, { 'x-api-key': REWARD_KEY });

      expect(res.status).toBe(200);
      expect(res.data.data.processed).toBe(true);
      const reward = res.data.data.rewards.find((r) => r.ruleKey === 'PRODUCT_REWARD_3');
      expect(reward).toBeDefined();
      expect(reward.amount).toBe(20);

      // Verify wallet balance
      const balance = await walletRequest(
        `/api/wallet/balance?userId=${FOOD_USER}`,
        'GET',
        null,
        { 'x-api-key': WALLET_KEY }
      );
      expect(balance.status).toBe(200);
      expect(balance.data.data.pointsBalance).toBe(20);
    });

    it('does NOT grant product reward when only 2 distinct products', async () => {
      const res = await rewardRequest('/api/reward/order', 'POST', {
        orderId: 'FOOD-ORD-2',
        userId: FOOD_USER,
        status: 'COMPLETED',
        items: [{ productId: 'f1' }, { productId: 'f2' }],
        source: 'FOOD_APP',
      }, { 'x-api-key': REWARD_KEY });

      expect(res.status).toBe(200);
      const reward = res.data.data.rewards.find((r) => r.ruleKey === 'PRODUCT_REWARD_3');
      expect(reward).toBeUndefined();
      expect(res.data.data.ignored.some((i) => i.ruleKey === 'PRODUCT_REWARD_3')).toBe(true);
    });

    it('blocks duplicate order processing', async () => {
      const res = await rewardRequest('/api/reward/order', 'POST', {
        orderId: 'FOOD-ORD-1',
        userId: FOOD_USER,
        status: 'COMPLETED',
        items: [
          { productId: 'f1' },
          { productId: 'f2' },
          { productId: 'f3' },
        ],
        source: 'FOOD_APP',
      }, { 'x-api-key': REWARD_KEY });

      expect(res.status).toBe(200);
      expect(res.data.data.processed).toBe(false);
      expect(res.data.data.reason).toContain('already been processed');
    });

    it('does not reward pending orders', async () => {
      const res = await rewardRequest('/api/reward/order', 'POST', {
        orderId: 'FOOD-ORD-3',
        userId: FOOD_USER,
        status: 'PENDING',
        items: [
          { productId: 'f1' },
          { productId: 'f2' },
          { productId: 'f3' },
        ],
        source: 'FOOD_APP',
      }, { 'x-api-key': REWARD_KEY });

      expect(res.status).toBe(200);
      expect(res.data.data.processed).toBe(false);
    });
  });

  describe('SuperMall Simulation -> Reward Service -> Wallet Service', () => {
    it('grants 20 points for a completed SuperMall order with 3 distinct products', async () => {
      const res = await rewardRequest('/api/reward/order', 'POST', {
        orderId: 'MALL-ORD-1',
        userId: MALL_USER,
        status: 'COMPLETED',
        items: [
          { productId: 'm1' },
          { productId: 'm2' },
          { productId: 'm3' },
        ],
        source: 'SUPERMALL_APP',
      }, { 'x-api-key': REWARD_KEY });

      expect(res.status).toBe(200);
      expect(res.data.data.source).toBe('SUPERMALL_APP');
      const reward = res.data.data.rewards.find((r) => r.ruleKey === 'PRODUCT_REWARD_3');
      expect(reward).toBeDefined();

      const balance = await walletRequest(
        `/api/wallet/balance?userId=${MALL_USER}`,
        'GET',
        null,
        { 'x-api-key': WALLET_KEY }
      );
      expect(balance.data.data.pointsBalance).toBe(20);
    });

    it('grants a free delivery token on the 10th completed order (milestone)', async () => {
      // MALL_USER already has 1 completed order; add 8 more (9 total), the 10th triggers the token
      for (let i = 2; i <= 9; i++) {
        await rewardRequest('/api/reward/order', 'POST', {
          orderId: `MALL-ORD-${i}`,
          userId: MALL_USER,
          status: 'COMPLETED',
          items: [{ productId: `m${i}` }],
          source: 'SUPERMALL_APP',
        }, { 'x-api-key': REWARD_KEY });
      }

      const tenth = await rewardRequest('/api/reward/order', 'POST', {
        orderId: 'MALL-ORD-10',
        userId: MALL_USER,
        status: 'COMPLETED',
        items: [{ productId: 'm10' }],
        source: 'SUPERMALL_APP',
      }, { 'x-api-key': REWARD_KEY });

      const milestone = tenth.data.data.rewards.find((r) => r.ruleKey === 'FREE_DELIVERY_10');
      expect(milestone).toBeDefined();
      expect(milestone.rewardType).toBe('Free Delivery Token');
      expect(milestone.amount).toBe(1);

      const balance = await walletRequest(
        `/api/wallet/balance?userId=${MALL_USER}`,
        'GET',
        null,
        { 'x-api-key': WALLET_KEY }
      );
      expect(balance.data.data.freeDeliveryTokens).toBe(1);
    });
  });

  describe('Reward Usage', () => {
    it('uses points from the wallet balance', async () => {
      const before = await walletRequest(
        `/api/wallet/balance?userId=${FOOD_USER}`,
        'GET',
        null,
        { 'x-api-key': WALLET_KEY }
      );
      const beforeBalance = before.data.data.pointsBalance;

      const res = await walletRequest('/api/wallet/use', 'POST', {
        userId: FOOD_USER,
        rewardType: 'Points',
        amount: 10,
        referenceId: 'USE-INT-1',
        referenceType: 'ORDER',
        description: 'Used 10 points in integration test',
      }, { 'x-api-key': WALLET_KEY });

      expect(res.status).toBe(200);
      expect(res.data.data.wallet.pointsBalance).toBe(beforeBalance - 10);
    });

    it('rejects using more points than available (422)', async () => {
      const res = await walletRequest('/api/wallet/use', 'POST', {
        userId: FOOD_USER,
        rewardType: 'Points',
        amount: 999999,
        referenceId: 'USE-INT-2',
        referenceType: 'ORDER',
      }, { 'x-api-key': WALLET_KEY });

      expect(res.status).toBe(422);
    });
  });

  describe('Free Delivery Token Usage', () => {
    it('uses the free delivery token', async () => {
      const res = await walletRequest('/api/wallet/use', 'POST', {
        userId: MALL_USER,
        rewardType: 'Free Delivery Token',
        amount: 1,
        referenceId: 'USE-TOKEN-1',
        referenceType: 'ORDER',
        description: 'Used free delivery token',
      }, { 'x-api-key': WALLET_KEY });

      expect(res.status).toBe(200);
      expect(res.data.data.wallet.freeDeliveryTokens).toBe(0);
    });

    it('rejects using a token when none available', async () => {
      const res = await walletRequest('/api/wallet/use', 'POST', {
        userId: MALL_USER,
        rewardType: 'Free Delivery Token',
        amount: 1,
        referenceId: 'USE-TOKEN-2',
        referenceType: 'ORDER',
      }, { 'x-api-key': WALLET_KEY });

      expect(res.status).toBe(422);
    });
  });

  describe('Referral Flow', () => {
    it('creates a referral record and rewards the referrer after the referred user completes an order', async () => {
      // Create the referral record
      const refCreate = await rewardRequest('/api/reward/referral', 'POST', {
        referrerUserId: REFERRER,
        referredUserId: REFERRED,
        referralCode: 'INT-REF-CODE',
      }, { 'x-api-key': REWARD_KEY });

      expect(refCreate.status).toBe(201);
      expect(refCreate.data.data.status).toBe('PENDING');

      // Referred user completes an order carrying the referral code
      const orderRes = await rewardRequest('/api/reward/order', 'POST', {
        orderId: 'REF-ORD-1',
        userId: REFERRED,
        status: 'COMPLETED',
        items: [
          { productId: 'r1' },
          { productId: 'r2' },
          { productId: 'r3' },
        ],
        referralCode: 'INT-REF-CODE',
        source: 'FOOD_APP',
      }, { 'x-api-key': REWARD_KEY });

      expect(orderRes.status).toBe(200);
      const refReward = orderRes.data.data.rewards.find((r) => r.ruleKey === 'REFERRAL_REWARD');
      expect(refReward).toBeDefined();
      expect(refReward.amount).toBe(100);

      // Referrer wallet should have 100 points
      const referrerBalance = await walletRequest(
        `/api/wallet/balance?userId=${REFERRER}`,
        'GET',
        null,
        { 'x-api-key': WALLET_KEY }
      );
      expect(referrerBalance.status).toBe(200);
      expect(referrerBalance.data.data.pointsBalance).toBe(100);

      // Referral marked REWARDED, so re-processing does not double reward
      const second = await rewardRequest('/api/reward/order', 'POST', {
        orderId: 'REF-ORD-2',
        userId: REFERRED,
        status: 'COMPLETED',
        items: [
          { productId: 'r1' },
          { productId: 'r2' },
          { productId: 'r3' },
        ],
        referralCode: 'INT-REF-CODE',
        source: 'FOOD_APP',
      }, { 'x-api-key': REWARD_KEY });

      const refReward2 = second.data.data.rewards.find((r) => r.ruleKey === 'REFERRAL_REWARD');
      expect(refReward2).toBeUndefined();
    });
  });

  describe('Expiry System', () => {
    it('expires old rewards and reduces balance', async () => {
      // Give the user a reward, then backdate its expiry in the DB
      const add = await walletRequest('/api/wallet/add', 'POST', {
        userId: EXP_USER,
        rewardType: 'Points',
        amount: 50,
        referenceId: 'EXP-INT-1',
        referenceType: 'MANUAL',
        description: 'Reward to be expired',
      }, { 'x-api-key': WALLET_KEY });
      expect(add.status).toBe(201);

      const reward = await walletConn
        .collection('rewardhistories')
        .findOne({ userId: EXP_USER, referenceId: 'EXP-INT-1' });
      expect(reward).toBeDefined();
      await walletConn
        .collection('rewardhistories')
        .updateOne(
          { _id: reward._id },
          { $set: { expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        );

      const expire = await walletRequest('/api/wallet/expire', 'POST', null, {
        'x-api-key': WALLET_KEY,
      });
      expect(expire.status).toBe(200);
      expect(expire.data.data.expiredCount).toBeGreaterThanOrEqual(1);

      // Balance reduced back to 0
      const balance = await walletRequest(
        `/api/wallet/balance?userId=${EXP_USER}`,
        'GET',
        null,
        { 'x-api-key': WALLET_KEY }
      );
      expect(balance.data.data.pointsBalance).toBe(0);

      // History retains the Expired entry
      const history = await walletRequest(
        `/api/wallet/history?userId=${EXP_USER}&status=Expired`,
        'GET',
        null,
        { 'x-api-key': WALLET_KEY }
      );
      expect(history.status).toBe(200);
      expect(history.data.data.history.length).toBeGreaterThanOrEqual(1);
      expect(history.data.data.history[0].status).toBe('Expired');
    });
  });

  describe('Error Handling', () => {
    it('rejects order with missing required fields (400)', async () => {
      const res = await rewardRequest('/api/reward/order', 'POST', {
        status: 'COMPLETED',
      }, { 'x-api-key': REWARD_KEY });
      expect(res.status).toBe(400);
    });

    it('rejects referral with duplicate referred user (409)', async () => {
      const res = await rewardRequest('/api/reward/referral', 'POST', {
        referrerUserId: REFERRER,
        referredUserId: REFERRED,
        referralCode: 'INT-REF-CODE-2',
      }, { 'x-api-key': REWARD_KEY });
      expect(res.status).toBe(409);
    });

    it('rejects invalid reward type in wallet use (400)', async () => {
      const res = await walletRequest('/api/wallet/use', 'POST', {
        userId: FOOD_USER,
        rewardType: 'INVALID_TYPE',
        amount: 10,
        referenceId: 'BAD-1',
        referenceType: 'ORDER',
      }, { 'x-api-key': WALLET_KEY });
      expect(res.status).toBe(400);
    });

    it('returns 404 for unknown reward route', async () => {
      const res = await rewardRequest('/api/reward/unknown', 'GET', null, {
        'x-api-key': REWARD_KEY,
      });
      expect(res.status).toBe(404);
    });
  });
});
