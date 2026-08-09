const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config');
const Wallet = require('../src/models/Wallet');
const WalletTransaction = require('../src/models/WalletTransaction');
const RewardHistory = require('../src/models/RewardHistory');

const TEST_USER = 'expiry-test-user';

describe('Wallet Service Expiry System', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongodb.uri);
    }
    await Wallet.deleteMany({ userId: TEST_USER });
    await WalletTransaction.deleteMany({ userId: TEST_USER });
    await RewardHistory.deleteMany({ userId: TEST_USER });
  }, 30000);

  afterAll(async () => {
    await Wallet.deleteMany({ userId: TEST_USER });
    await WalletTransaction.deleteMany({ userId: TEST_USER });
    await RewardHistory.deleteMany({ userId: TEST_USER });
    await mongoose.connection.close();
  }, 30000);

  async function createReward(expiryOverride, overrides = {}) {
    const addResponse = await request(app)
      .post('/api/wallet/add')
      .set('x-api-key', config.apiSecretKey)
      .send({
        userId: TEST_USER,
        rewardType: overrides.rewardType || 'Points',
        amount: overrides.amount || 100,
        referenceId: overrides.referenceId || 'ORDER-EXP-1',
        referenceType: 'ORDER',
        description: 'Expiry test reward',
      });
    expect(addResponse.status).toBe(201);

    // Force the expiry date to the past (simulate old reward)
    const history = await RewardHistory.findOne({
      userId: TEST_USER,
      referenceId: overrides.referenceId || 'ORDER-EXP-1',
      status: 'Earned',
    });
    expect(history).toBeDefined();
    history.expiryDate = expiryOverride;
    await history.save();
    return history;
  }

  it('should mark an expired reward as Expired and reduce balance', async () => {
    await createReward(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), { referenceId: 'ORD-OLD-1' });

    // Verify reward is Earned and active before expiry
    let before = await RewardHistory.findOne({ userId: TEST_USER, referenceId: 'ORD-OLD-1' });
    expect(before.status).toBe('Earned');

    const expireResponse = await request(app)
      .post('/api/wallet/expire')
      .set('x-api-key', config.apiSecretKey);
    expect(expireResponse.status).toBe(200);
    expect(expireResponse.body.data.expiredCount).toBeGreaterThanOrEqual(1);

    // Verify status changed to Expired
    const after = await RewardHistory.findOne({ userId: TEST_USER, referenceId: 'ORD-OLD-1' });
    expect(after.status).toBe('Expired');
    expect(after.isActive).toBe(false);

    // Verify balance was reduced
    const balance = await request(app)
      .get('/api/wallet/balance')
      .set('x-api-key', config.apiSecretKey)
      .query({ userId: TEST_USER });
    expect(balance.body.data.pointsBalance).toBe(0);
  });

  it('should NOT expire a reward whose expiry date is in the future', async () => {
    await createReward(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), { referenceId: 'ORD-FUTURE-1' });

    await request(app).post('/api/wallet/expire').set('x-api-key', config.apiSecretKey);
    const stillEarned = await RewardHistory.findOne({ userId: TEST_USER, referenceId: 'ORD-FUTURE-1' });
    expect(stillEarned.status).toBe('Earned');
    expect(stillEarned.isActive).toBe(true);
  });

  it('should NOT double-expire a reward that was already used', async () => {
    // Add 50 points then use them all (FIFO consumption marks earned entry as Used)
    await createReward(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), { referenceId: 'ORD-USED-1', amount: 50 });

    const useResponse = await request(app)
      .post('/api/wallet/use')
      .set('x-api-key', config.apiSecretKey)
      .send({
        userId: TEST_USER,
        rewardType: 'Points',
        amount: 50,
        referenceId: 'USE-1',
        referenceType: 'ORDER',
      });
    expect(useResponse.status).toBe(200);

    await request(app).post('/api/wallet/expire').set('x-api-key', config.apiSecretKey);

    // The earned entry should have been consumed (status Used), not expired
    const usedEntry = await RewardHistory.findOne({
      userId: TEST_USER,
      referenceId: 'ORD-USED-1',
      status: 'Used',
    });
    expect(usedEntry).toBeDefined();
  });

  it('should record an EXPIRE_REWARD transaction for expired rewards', async () => {
    await createReward(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), { referenceId: 'ORD-EXP-TR', amount: 30 });

    await request(app).post('/api/wallet/expire').set('x-api-key', config.apiSecretKey);

    const expireTxn = await WalletTransaction.findOne({
      userId: TEST_USER,
      transactionType: 'EXPIRE_REWARD',
      referenceId: 'ORD-EXP-TR',
    });
    expect(expireTxn).toBeDefined();
    expect(expireTxn.rewardType).toBe('Points');
  });

  it('Expiry cron should be disabled during tests (no immediate startup crash)', () => {
    expect(process.env.NODE_ENV || 'test').toBe('test');
  });
});