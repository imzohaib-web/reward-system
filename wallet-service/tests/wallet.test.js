const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config');
const Wallet = require('../src/models/Wallet');
const WalletTransaction = require('../src/models/WalletTransaction');
const RewardHistory = require('../src/models/RewardHistory');

const TEST_USER_ID = 'test-user-comprehensive-1';

describe('Wallet Service API Comprehensive', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongodb.uri);
    }
    await Wallet.deleteMany({ userId: TEST_USER_ID });
    await WalletTransaction.deleteMany({ userId: TEST_USER_ID });
    await RewardHistory.deleteMany({ userId: TEST_USER_ID });
  }, 30000);

  afterAll(async () => {
    await Wallet.deleteMany({ userId: TEST_USER_ID });
    await WalletTransaction.deleteMany({ userId: TEST_USER_ID });
    await RewardHistory.deleteMany({ userId: TEST_USER_ID });
    await mongoose.connection.close();
  }, 30000);

  describe('Add Reward Flow', () => {
    it('should add points and create earned history', async () => {
      const addResponse = await request(app)
        .post('/api/wallet/add').set('x-api-key', config.apiSecretKey)
        .send({
          userId: TEST_USER_ID,
          rewardType: 'Points',
          amount: 100,
          referenceId: 'ORDER-ADD-001',
          referenceType: 'ORDER',
          description: 'Completed order reward',
        });

      expect(addResponse.status).toBe(201);
      expect(addResponse.body.data.wallet.pointsBalance).toBe(100);
      expect(addResponse.body.data.transaction.transactionType).toBe('EARN_POINTS');

      const historyResponse = await request(app)
        .get('/api/wallet/history').set('x-api-key', config.apiSecretKey)
        .query({ userId: TEST_USER_ID });

      expect(historyResponse.status).toBe(200);
      const pointsHistory = historyResponse.body.data.history.find(h => h.rewardType === 'Points');
      expect(pointsHistory).toBeDefined();
      expect(pointsHistory.status).toBe('Earned');
    });

    it('should add free delivery token with expiry', async () => {
      const addResponse = await request(app)
        .post('/api/wallet/add').set('x-api-key', config.apiSecretKey)
        .send({
          userId: TEST_USER_ID,
          rewardType: 'Free Delivery Token',
          amount: 1,
          referenceId: 'ORDER-ADD-002',
          referenceType: 'ORDER_MILESTONE',
          description: '10th order reward',
        });

      expect(addResponse.status).toBe(201);
      expect(addResponse.body.data.wallet.freeDeliveryTokens).toBe(1);

      const historyResponse = await request(app)
        .get('/api/wallet/history').set('x-api-key', config.apiSecretKey)
        .query({ userId: TEST_USER_ID, rewardType: 'Free Delivery Token' });

      expect(historyResponse.status).toBe(200);
      const tokenHistory = historyResponse.body.data.history[0];
      expect(tokenHistory.expiryDate).toBeDefined();
    });
  });

  describe('Balance Flow', () => {
    it('should return correct balance', async () => {
      const response = await request(app)
        .get('/api/wallet/balance').set('x-api-key', config.apiSecretKey)
        .query({ userId: TEST_USER_ID });

      expect(response.status).toBe(200);
      expect(response.body.data.pointsBalance).toBe(100);
      expect(response.body.data.freeDeliveryTokens).toBe(1);
    });
  });

  describe('Use Reward Flow', () => {
    it('should use points', async () => {
      const useResponse = await request(app)
        .post('/api/wallet/use').set('x-api-key', config.apiSecretKey)
        .send({
          userId: TEST_USER_ID,
          rewardType: 'Points',
          amount: 50,
          referenceId: 'ORDER-USE-001',
          referenceType: 'ORDER',
          description: 'Points used for discount',
        });

      expect(useResponse.status).toBe(200);
      expect(useResponse.body.data.wallet.pointsBalance).toBe(50);

      const historyResponse = await request(app)
        .get('/api/wallet/history').set('x-api-key', config.apiSecretKey)
        .query({ userId: TEST_USER_ID, status: 'Used' });

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.data.history.length).toBeGreaterThan(0);
    });

    it('should use free delivery token', async () => {
      const useResponse = await request(app)
        .post('/api/wallet/use').set('x-api-key', config.apiSecretKey)
        .send({
          userId: TEST_USER_ID,
          rewardType: 'Free Delivery Token',
          amount: 1,
          referenceId: 'ORDER-USE-002',
          referenceType: 'ORDER',
          description: 'Free delivery used',
        });

      expect(useResponse.status).toBe(200);
      expect(useResponse.body.data.wallet.freeDeliveryTokens).toBe(0);
    });
  });

  describe('Remove Reward Flow', () => {
    it('should remove points on reversal', async () => {
      const removeResponse = await request(app)
        .post('/api/wallet/remove').set('x-api-key', config.apiSecretKey)
        .send({
          userId: TEST_USER_ID,
          rewardType: 'Points',
          amount: 30,
          referenceId: 'REV-001',
          referenceType: 'REVERSAL',
          description: 'Order cancelled reward reversal',
        });

      expect(removeResponse.status).toBe(200);
      expect(removeResponse.body.data.wallet.pointsBalance).toBe(20);

      const historyResponse = await request(app)
        .get('/api/wallet/history').set('x-api-key', config.apiSecretKey)
        .query({ userId: TEST_USER_ID, status: 'Reversed' });

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.data.history.length).toBeGreaterThan(0);
    });
  });

  describe('Error Cases', () => {
    it('should reject insufficient points to use', async () => {
      const useResponse = await request(app)
        .post('/api/wallet/use').set('x-api-key', config.apiSecretKey)
        .send({
          userId: TEST_USER_ID,
          rewardType: 'Points',
          amount: 1000,
          referenceId: 'ORDER-USE-003',
          referenceType: 'ORDER',
        });

      expect(useResponse.status).toBe(422);
      expect(useResponse.body.status).toBe('fail');
      expect(useResponse.body.message).toContain('Insufficient');
    });

    it('should reject invalid reward type on add', async () => {
      const addResponse = await request(app)
        .post('/api/wallet/add').set('x-api-key', config.apiSecretKey)
        .send({
          userId: TEST_USER_ID,
          rewardType: 'InvalidType',
          amount: 100,
          referenceId: 'ORDER-ADD-003',
          referenceType: 'ORDER',
        });

      expect(addResponse.status).toBe(400);
      expect(addResponse.body.status).toBe('error');
    });

    it('should reject missing userId', async () => {
      const balanceResponse = await request(app)
        .get('/api/wallet/balance').set('x-api-key', config.apiSecretKey);

      expect(balanceResponse.status).toBe(400);
    });
  });
});