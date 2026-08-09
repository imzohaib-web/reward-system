const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config');
const RewardRule = require('../src/models/RewardRule');
const RewardTransaction = require('../src/models/RewardTransaction');
const ReferralRecord = require('../src/models/ReferralRecord');
const RewardLog = require('../src/models/RewardLog');
const seedDefaultRules = require('../src/utils/seedRules');
const walletApiClient = require('../src/services/walletApiClient');

const TEST_USER = 'reward-test-user-1';
const TEST_USER2 = 'reward-test-referrer-1';

describe('Reward Service API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongodb.uri);
    }
    await seedDefaultRules();
    await RewardTransaction.deleteMany({ userId: { $in: [TEST_USER, TEST_USER2] } });
    await ReferralRecord.deleteMany({ $or: [{ referrerUserId: TEST_USER2 }, { referredUserId: TEST_USER }] });
    await RewardLog.deleteMany({});
  }, 30000);

  afterAll(async () => {
    await RewardTransaction.deleteMany({ userId: { $in: [TEST_USER, TEST_USER2] } });
    await ReferralRecord.deleteMany({ $or: [{ referrerUserId: TEST_USER2 }, { referredUserId: TEST_USER }] });
    await RewardLog.deleteMany({});
    await mongoose.connection.close();
  }, 30000);

  describe('POST /api/reward/order - Order Processing', () => {
    it('should NOT generate reward for non-completed order', async () => {
      const response = await request(app)
        .post('/api/reward/order').set('x-api-key', config.apiSecretKey)
        .send({
          orderId: 'ORDER-PENDING-1',
          userId: TEST_USER,
          status: 'PENDING',
          items: [
            { productId: 'p1' },
            { productId: 'p2' },
            { productId: 'p3' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.processed).toBe(false);
      expect(response.body.data.rewards).toBeUndefined();
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/reward/order').set('x-api-key', config.apiSecretKey)
        .send({
          status: 'COMPLETED',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Reward Transaction Unique Index (Duplicate Protection)', () => {
    it('should enforce unique (orderId, ruleKey)', async () => {
      await RewardTransaction.deleteMany({ orderId: 'ORDER-DUP-1' });

      await RewardTransaction.create({
        orderId: 'ORDER-DUP-1',
        userId: TEST_USER,
        rewardType: 'Points',
        ruleKey: 'PRODUCT_REWARD_3',
        ruleType: 'PRODUCT_REWARD',
        amount: 20,
        source: 'ORDER',
        status: 'COMPLETED',
      });

      let duplicateError = null;
      try {
        await RewardTransaction.create({
          orderId: 'ORDER-DUP-1',
          userId: TEST_USER,
          rewardType: 'Points',
          ruleKey: 'PRODUCT_REWARD_3',
          ruleType: 'PRODUCT_REWARD',
          amount: 20,
          source: 'ORDER',
          status: 'COMPLETED',
        });
      } catch (error) {
        duplicateError = error;
      }

      expect(duplicateError).toBeDefined();
      expect(duplicateError.code).toBe(11000);
      await RewardTransaction.deleteMany({ orderId: 'ORDER-DUP-1' });
    });
  });

  describe('Reward Rules Management', () => {
    it('should return default seeded rules', async () => {
      const response = await request(app)
        .get('/api/reward/rules').set('x-api-key', config.apiSecretKey);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      const keys = response.body.data.map((r) => r.ruleKey);
      expect(keys).toContain('REFERRAL_REWARD');
      expect(keys).toContain('PRODUCT_REWARD_3');
      expect(keys).toContain('FREE_DELIVERY_10');
    });

    it('should update reward rule value', async () => {
      const response = await request(app)
        .put('/api/reward/rules/PRODUCT_REWARD_3').set('x-api-key', config.apiSecretKey)
        .send({ value: 25 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.value).toBe(25);
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .put('/api/reward/rules/REFERRAL_REWARD').set('x-api-key', config.apiSecretKey)
        .send({ status: 'INVALID' });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent rule', async () => {
      const response = await request(app)
        .put('/api/reward/rules/NON_EXISTENT_RULE').set('x-api-key', config.apiSecretKey)
        .send({ value: 10 });

      expect(response.status).toBe(404);
    });
  });

  describe('Referral Record Creation', () => {
    it('should create a referral record', async () => {
      const response = await request(app)
        .post('/api/reward/referral').set('x-api-key', config.apiSecretKey)
        .send({
          referrerUserId: TEST_USER2,
          referredUserId: TEST_USER,
          referralCode: 'REF-CODE-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('PENDING');
    });

    it('should reject duplicate referral for same user', async () => {
      const response = await request(app)
        .post('/api/reward/referral').set('x-api-key', config.apiSecretKey)
        .send({
          referrerUserId: TEST_USER2,
          referredUserId: TEST_USER,
          referralCode: 'REF-CODE-2',
        });

      expect(response.status).toBe(409);
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/reward/referral').set('x-api-key', config.apiSecretKey)
        .send({
          referredUserId: TEST_USER,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Wallet API client configuration', () => {
    it('should point to wallet service', () => {
      expect(walletApiClient.baseUrl).toBe(config.walletService.url);
    });
  });

  describe('Completed Order Reward Flow (Integration with Wallet)', () => {
    const INT_USER = 'int-test-user';

    beforeAll(async () => {
      await RewardTransaction.deleteMany({ userId: INT_USER });
      await RewardRule.updateOne({ ruleKey: 'PRODUCT_REWARD_3' }, { $set: { value: 20, status: 'Active' } });
      await RewardRule.updateOne({ ruleKey: 'FREE_DELIVERY_10' }, { $set: { status: 'Active' } });
    }, 30000);

    it('should grant 20 points for 3 distinct products in a completed order', async () => {
      const response = await request(app)
        .post('/api/reward/order').set('x-api-key', config.apiSecretKey)
        .send({
          orderId: 'INT-PROD-1',
          userId: INT_USER,
          status: 'COMPLETED',
          items: [
            { productId: 'prod-a' },
            { productId: 'prod-b' },
            { productId: 'prod-c' },
          ],
          source: 'FOOD_APP',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.processed).toBe(true);
      const productReward = response.body.data.rewards.find((r) => r.ruleKey === 'PRODUCT_REWARD_3');
      expect(productReward).toBeDefined();
      expect(productReward.rewardType).toBe('Points');
      expect(productReward.amount).toBe(20);
      expect(productReward.walletTransactionId).toBeDefined();
    });

    it('should not grant duplicate reward when the same order is sent again', async () => {
      const first = await request(app)
        .post('/api/reward/order').set('x-api-key', config.apiSecretKey)
        .send({
          orderId: 'INT-DUP-ORDER',
          userId: INT_USER,
          status: 'COMPLETED',
          items: [
            { productId: 'prod-x' },
            { productId: 'prod-y' },
            { productId: 'prod-z' },
          ],
          source: 'FOOD_APP',
        });

      const second = await request(app)
        .post('/api/reward/order').set('x-api-key', config.apiSecretKey)
        .send({
          orderId: 'INT-DUP-ORDER',
          userId: INT_USER,
          status: 'COMPLETED',
          items: [
            { productId: 'prod-x' },
            { productId: 'prod-y' },
            { productId: 'prod-z' },
          ],
          source: 'FOOD_APP',
        });

      expect(first.body.data.rewards.length).toBeGreaterThan(0);
      expect(second.body.data.processed).toBe(false);
      expect(second.body.data.reason).toContain('already been processed');
    });

    it('should not grant product reward for only 2 distinct products', async () => {
      const response = await request(app)
        .post('/api/reward/order').set('x-api-key', config.apiSecretKey)
        .send({
          orderId: 'INT-PROD-2',
          userId: INT_USER,
          status: 'COMPLETED',
          items: [{ productId: 'prod-1' }, { productId: 'prod-2' }],
          source: 'FOOD_APP',
        });

      expect(response.status).toBe(200);
      const productReward = response.body.data.rewards.find((r) => r.ruleKey === 'PRODUCT_REWARD_3');
      expect(productReward).toBeUndefined();
      const ignored = response.body.data.ignored.find((i) => i.ruleKey === 'PRODUCT_REWARD_3');
      expect(ignored).toBeDefined();
    });

    it('should grant 1 free delivery token after 10 completed orders', async () => {
      const MILESTONE_USER = 'int-ms-test-user';
      await RewardTransaction.deleteMany({ userId: MILESTONE_USER });

      for (let i = 1; i <= 9; i++) {
        await request(app)
          .post('/api/reward/order').set('x-api-key', config.apiSecretKey)
          .send({
            orderId: `INT-MS-T-${i}`,
            userId: MILESTONE_USER,
            status: 'COMPLETED',
            items: [{ productId: `ms-${i}` }],
            source: 'FOOD_APP',
          });
      }

      const tenth = await request(app)
        .post('/api/reward/order').set('x-api-key', config.apiSecretKey)
        .send({
          orderId: 'INT-MS-T-10',
          userId: MILESTONE_USER,
          status: 'COMPLETED',
          items: [{ productId: 'ms-10' }],
          source: 'FOOD_APP',
        });

      const milestoneReward = tenth.body.data.rewards.find((r) => r.ruleKey === 'FREE_DELIVERY_10');
      expect(milestoneReward).toBeDefined();
      expect(milestoneReward.rewardType).toBe('Free Delivery Token');
      expect(milestoneReward.amount).toBe(1);
    });
  });
});