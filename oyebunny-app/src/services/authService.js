import { apiRequest } from './apiClient';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:5000';

export const authService = {
  async login(credentials) {
    return apiRequest(`${AUTH_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(userData) {
    return apiRequest(`${AUTH_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getMe() {
    return apiRequest(`${AUTH_URL}/api/auth/me`, {
      method: 'GET',
    });
  },
};
