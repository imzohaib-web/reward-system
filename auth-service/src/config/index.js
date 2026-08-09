require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3003,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db?retryWrites=false',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'auth_service_customer_jwt_secret_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  apiSecretKey: process.env.API_SECRET_KEY || 'auth_service_api_secret_2024',
  adminPanel: {
    url: process.env.ADMIN_PANEL_URL || 'http://localhost:3000',
  },
};
