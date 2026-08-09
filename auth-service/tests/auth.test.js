const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config');
const Customer = require('../src/models/Customer');

const TEST_EMAIL = 'customer-test@example.com';

describe('Auth Service API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongodb.uri);
    }
    await Customer.deleteMany({ email: TEST_EMAIL });
  }, 30000);

  afterAll(async () => {
    await Customer.deleteMany({ email: TEST_EMAIL });
    await mongoose.connection.close();
  }, 30000);

  describe('POST /api/auth/register', () => {
    it('should register a new customer and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer',
          email: TEST_EMAIL,
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.customer.email).toBe(TEST_EMAIL);
      expect(response.body.data.customer.name).toBe('Test Customer');

      // Verify data persisted in DB and password is hashed
      const customer = await Customer.findOne({ email: TEST_EMAIL });
      expect(customer).toBeDefined();
      expect(customer.password).not.toBe('password123');
    });

    it('should reject duplicate email (409)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another Customer',
          email: TEST_EMAIL,
          password: 'password123',
        });

      expect(response.status).toBe(409);
    });

    it('should reject missing fields (400)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'nofields@example.com',
        });

      expect(response.status).toBe(400);
    });

    it('should reject short password (400)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pw',
          email: 'shortpw@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.customer.email).toBe(TEST_EMAIL);
    });

    it('should reject wrong password (401)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should reject unknown email (401)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the authenticated customer profile', async () => {
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: 'password123' });

      const token = login.body.data.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(TEST_EMAIL);
    });

    it('should reject requests without a token (401)', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });

    it('should reject requests with an invalid token (401)', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(response.status).toBe(401);
    });
  });

  describe('Health Check', () => {
    it('should return service status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });
});
