const request = require('supertest');
const app = require('../src/app');

describe('Wallet Service Health Check', () => {
  it('GET /health should return 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Wallet Service is running');
  });
});