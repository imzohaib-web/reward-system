const { MongoMemoryServer } = require('mongodb-memory-server');

async function startMongo() {
  console.log('Starting zero-setup local MongoDB on port 27017...');
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
      },
    });
    console.log('----------------------------------------------------');
    console.log('✅ Zero-Setup MongoDB is LIVE on port 27017!');
    console.log('URI:', mongod.getUri());
    console.log('Ready for auth-service, reward-service, and wallet-service.');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('Failed to start in-memory MongoDB:', err.message);
  }
}

startMongo();
