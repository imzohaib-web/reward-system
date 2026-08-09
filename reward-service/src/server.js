const connectDB = require('./config/database');
const app = require('./app');
const config = require('./config');
const seedDefaultRules = require('./utils/seedRules');
const seedAdmin = require('./utils/seedAdmin');

const startServer = () => {
  app.listen(config.port, () => {
    console.log(`Reward Service running on port ${config.port} in ${config.env} mode`);
  });

  connectDB()
    .then(async () => {
      await seedDefaultRules();
      await seedAdmin();
    })
    .catch((err) => {
      console.error('Reward Service database initialization warning:', err.message);
    });
};

startServer();