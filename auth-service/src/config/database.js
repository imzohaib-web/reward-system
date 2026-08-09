const mongoose = require('mongoose');
const config = require('./index');

// Disable Mongoose command buffering so queries fail fast instead of hanging 10 seconds
mongoose.set('bufferCommands', false);

async function connectDatabase() {
  console.log(`Connecting to Auth Service MongoDB at ${config.mongodb.uri}...`);
  try {
    await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected successfully to ${config.mongodb.uri}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error (${config.mongodb.uri}): ${error.message}`);
    
    // Fallback to in-memory server if port 27017 was refused
    if (error.message.includes('ECONNREFUSED')) {
      try {
        console.log('Attempting embedded MongoMemoryServer connection on port 27017...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create({ instance: { port: 27017 } });
        await mongoose.connect(mongoServer.getUri() + 'auth_db', {
          serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ MongoDB connected successfully via embedded MongoMemoryServer!');
        return true;
      } catch (fallbackErr) {
        console.error('❌ Embedded MongoMemoryServer connection failed:', fallbackErr.message);
      }
    }
    return false;
  }
}

module.exports = connectDatabase;
