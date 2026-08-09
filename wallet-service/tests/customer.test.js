const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const config = require('../src/config');
const Wallet = require('../src/models/Wallet');
const WalletTransaction = require('../src/models/WalletTransaction');
const RewardHistory = require('../src/models/RewardHistory');

const TEST_CUSTOMER_ID = 'customer-auth-test-1';

function customerToken(customerId) {
  return jwt.sign(
    { id: customerId, email: 'customer@test.com', role: 'CUSTOMER' },
    config.customerJwt.secret,
    { expiresIn: '1h' }
  );
}

describe('Customer Wallet Endpoints', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongodb.uri);
    }
    await Wallet.deleteMany({ userId: TEST_CUSTOMER_ID });
    await WalletTransaction.deleteMany({ userId: TEST_CUSTOMER_ID });
    await RewardHistory.deleteMany({ userId: TEST_CUSTOMER_ID });
  }, 30000);

  afterAll(async () => {
    await Wallet.deleteMany({ userId: TEST_CUSTOMER_ID });
    await WalletTransaction.deleteMany({ userId: TEST_CUSTOMER_ID });
    await RewardHistory.deleteMany({ userId: TEST_CUSTOMER_ID });
    await mongoose.connection.close();
  }, 30000);

  it('should reject requests without a customer token (401)', async () => {
    const response = await request(app).get('/api/customer/wallet');
    expect(response.status).toBe(401);
  });

  it('should reject requests with an invalid token (401)', async () => {
    const response = await request(app)
      .get('/api/customer/wallet')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(response.status).toBe(401);
  });

  it('should return wallet balance for the authenticated customer', async () => {
    const token = customerToken(TEST_CUSTOMER_ID);

    // Add points via admin/wallet add endpoint
    const add = await request(app)
      .post('/api/wallet/add')
      .set('x-api-key', config.apiSecretKey)
      .send({
        userId: TEST_CUSTOMER_ID,
        rewardType: 'Points',
        amount: 100,
        referenceId: 'CUST-ADD-1',
        referenceType: 'MANUAL',
        description: 'Test reward',
      });
    expect(add.status).toBe(201);

    const response = await request(app)
      .get('/api/customer/wallet')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.pointsBalance).toBe(100);
  });

  it('should return the customer reward history', async () => {
    const token = customerToken(TEST_CUSTOMER_ID);

    const response = await request(app)
      .get('/api/customer/history')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('should let the customer use their own points', async () => {
    const token = customerToken(TEST_CUSTOMER_ID);

    const response = await request(app)
      .post('/api/customer/use')
      .set('Authorization', `Bearer ${token}`)
      .send({
        rewardType: 'Points',
        amount: 30,
        referenceId: 'CUST-USE-1',
        referenceType: 'ORDER',
        description: 'Customer used points',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.wallet.pointsBalance).toBe(70);
  });

  it('should prevent a customer from using another customers points (uses token identity)', async () => {
    const otherToken = customerToken('some-other-customer');

    // This user has no wallet - using points must fail
    const response = await request(app)
      .post('/api/customer/use')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        rewardType: 'Points',
        amount: 10,
        referenceId: 'CUST-USE-2',
        referenceType: 'ORDER',
      });

    expect(response.status).toBe(404);
  });

  it('should reject an admin JWT on customer endpoints', async () => {
    const adminToken = jwt.sign(
      { id: 'admin-id', email: 'admin@wallet.com', role: 'ADMIN' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get('/api/customer/wallet')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(401);
  });
});
