require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlas() {
  const uri = process.env.MONGODB_URI;
  console.log(`[LifePulse Test] Attempting to connect to MongoDB Atlas...`);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[LifePulse Test] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[LifePulse Test] Database name: ${conn.connection.name}`);
    await mongoose.disconnect();
    console.log(`[LifePulse Test] Connection verified and closed cleanly!`);
    process.exit(0);
  } catch (err) {
    console.error(`[LifePulse Test] Atlas connection error: ${err.message}`);
    process.exit(1);
  }
}

testAtlas();
