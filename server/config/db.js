const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lifepulse';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[LifePulse DB] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[LifePulse DB] Local MongoDB daemon at ${uri} unavailable (${err.message}). Starting embedded Mongo engine...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'lifepulse',
        },
      });

      const memUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[LifePulse DB] Embedded MongoDB engine online: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[LifePulse DB] Failed to start embedded MongoDB: ${memErr.message}`);
      throw memErr;
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
