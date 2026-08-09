const app = require('./app');
const config = require('./config');
const connectDatabase = require('./config/database');

function startServer() {
  console.log('Initializing Auth Service...');
  
  // Open HTTP port 5000 immediately
  app.listen(config.port, () => {
    console.log(`Auth Service running on port ${config.port}`);
  });

  // Connect to Database asynchronously
  connectDatabase()
    .then((dbConnected) => {
      if (dbConnected) {
        console.log('✅ Auth Service ready to process registration & login requests.');
      } else {
        console.warn('⚠️ Auth Service listening on port ' + config.port + ' (MongoDB offline - requests will return 503 error).');
      }
    })
    .catch((err) => {
      console.error('Database initialization warning:', err.message);
    });
}

startServer();
