require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedInitialFoods } = require('./utils/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB (or embedded MongoMemoryServer fallback)
    await connectDB();

    // Seed default food items if empty
    await seedInitialFoods();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`[LifePulse Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('[LifePulse Unhandled Rejection]:', err);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('[LifePulse Server Startup Error]:', error.message);
    process.exit(1);
  }
};

startServer();

