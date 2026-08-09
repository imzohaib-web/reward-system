require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3002,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wallet_db?retryWrites=false',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'wallet_service_jwt_secret_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  customerJwt: {
    secret: process.env.CUSTOMER_JWT_SECRET || 'auth_service_customer_jwt_secret_2024',
  },
  apiSecretKey: process.env.API_SECRET_KEY || 'wallet_service_api_secret_2024',
  rewardService: {
    url: process.env.REWARD_SERVICE_URL || 'http://localhost:3001',
  },
  adminPanel: {
    url: process.env.ADMIN_PANEL_URL || 'http://localhost:3000',
  },
  admin: {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@wallet.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },
  expiryCron: process.env.EXPIRY_CRON || '0 2 * * *',
};