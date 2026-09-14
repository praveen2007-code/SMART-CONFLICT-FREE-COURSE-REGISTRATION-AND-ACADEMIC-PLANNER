import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { initDatabase } from './config/db';
import { connectRedis } from './config/redis';
import { SeatService } from './services/seatService';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, docker internal)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (ENV.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use('/api', apiRouter);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
const startServer = async () => {
  console.log('====================================================');
  console.log(' Starting Smart Course Registration & Academic Planner API');
  console.log('====================================================');

  // Initialize DB
  const dbOk = await initDatabase();
  if (dbOk) {
    // Connect Redis
    await connectRedis();
    // Synchronize initial seats into Redis
    await SeatService.syncAllSeats();
  }

  app.listen(ENV.PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${ENV.PORT}`);
    console.log(`📡 REST API available at http://localhost:${ENV.PORT}/api`);
    console.log(`🩺 Health check at http://localhost:${ENV.PORT}/api/health`);
    console.log('====================================================');
  });
};

startServer().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});

export default app;
