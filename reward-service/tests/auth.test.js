const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config');
const Admin = require('../src/models/Admin');
const seedAdmin = require('../src/utils/seedAdmin');

describe('Reward Service Authentication', () => {
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
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.admin.email).toBe(config.admin.email);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: config.admin.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });

    it('should reject missing email/password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@rewards.com' });

      expect(response.status).toBe(400);
    });
  });

  describe('Protected Routes', () => {
    it('should reject request with NO authentication', async () => {
      const response = await request(app).get('/api/reward/rules');
      expect(response.status).toBe(401);
    });

    it('should reject request with WRONG API key', async () => {
      const response = await request(app)
        .get('/api/reward/rules')
        .set('x-api-key', 'wrong-api-key');

      expect(response.status).toBe(403);
    });

    it('should allow request with VALID API key', async () => {
      const response = await request(app)
        .get('/api/reward/rules')
        .set('x-api-key', config.apiSecretKey);

      expect(response.status).toBe(200);
    });

    it('should reject request with INVALID JWT token', async () => {
      const response = await request(app)
        .get('/api/reward/rules')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(response.status).toBe(401);
    });

    it('should allow request with VALID JWT token', async () => {
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: config.admin.email, password: config.admin.password });

      const token = login.body.data.token;
      const response = await request(app)
        .get('/api/reward/rules')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });

  describe('JWT token access', () => {
    it('should reject access to /me without token', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });
  });
});