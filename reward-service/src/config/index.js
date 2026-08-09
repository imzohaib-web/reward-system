require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/reward_db?retryWrites=false',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'reward_service_jwt_secret_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  apiSecretKey: process.env.API_SECRET_KEY || 'reward_service_api_secret_2024',
  walletService: {
    url: process.env.WALLET_SERVICE_URL || 'http://localhost:3002',
    apiKey: process.env.WALLET_SERVICE_API_KEY || 'wallet_service_api_secret_2024',
  },
  adminPanel: {
    url: process.env.ADMIN_PANEL_URL || 'http://localhost:3000',
  },
  admin: {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@rewards.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },
};