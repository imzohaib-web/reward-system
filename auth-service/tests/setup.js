const mongoose = require('mongoose');
const config = require('../src/config');

module.exports = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodb.uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    }
    console.log('Test MongoDB Connected');
  } catch (error) {
    console.error('Test MongoDB Connection Error:', error);
    process.exit(1);
  }
};
