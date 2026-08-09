const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config');
const seedAdmin = require('../src/utils/seedAdmin');

describe('Wallet Service Authentication', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongodb.uri);
    }
    await seedAdmin();
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.close();
  }, 30000);

  describe('Admin Login (JWT)', () => {
    it('should login with valid credentials and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: config.admin.email,
          password: config.admin.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: config.admin.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Protected Routes', () => {
    it('should reject request with NO authentication', async () => {
      const response = await request(app).get('/api/wallet/balance');
      expect(response.status).toBe(401);
    });

    it('should reject request with WRONG API key', async () => {
      const response = await request(app)
        .get('/api/wallet/balance')
        .set('x-api-key', 'wrong-api-key');

      expect(response.status).toBe(403);
    });

    it('should allow request with VALID API key', async () => {
      const response = await request(app)
        .get('/api/wallet/balance?userId=auth-test-user')
        .set('x-api-key', config.apiSecretKey);

      expect(response.status).toBe(200);
    });

    it('should reject request with INVALID JWT token', async () => {
      const response = await request(app)
        .get('/api/wallet/balance?userId=auth-test-user')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(response.status).toBe(401);
    });

    it('should allow request with VALID JWT token', async () => {
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: config.admin.email, password: config.admin.password });

      const token = login.body.data.token;
      const response = await request(app)
        .get('/api/wallet/balance?userId=auth-test-user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });
});