const connectDB = require('./config/database');
const app = require('./app');
const config = require('./config');
const seedAdmin = require('./utils/seedAdmin');
const initExpiryCron = require('./services/expiryCron');

const startServer = () => {
  app.listen(config.port, () => {
    console.log(`Wallet Service running on port ${config.port} in ${config.env} mode`);
  });

  connectDB()
    .then(async () => {
      await seedAdmin();
      initExpiryCron();
    })
    .catch((err) => {
      console.error('Wallet Service database initialization warning:', err.message);
    });
};

startServer();