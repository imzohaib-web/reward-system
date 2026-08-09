const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`Wallet Service MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Wallet Service MongoDB connection error: ${error.message}. Retrying in background...`);
  }
};

module.exports = connectDB;