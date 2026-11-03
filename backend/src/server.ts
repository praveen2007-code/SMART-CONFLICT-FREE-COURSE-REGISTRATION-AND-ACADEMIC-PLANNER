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

// Health check — BEFORE initialization middleware so it always responds
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Smart Course Registration API',
    environment: ENV.NODE_ENV
  });
});

// Lazy initialization state
let initialized = false;
let initError: string | null = null;

const initializeApp = async () => {
  if (initialized) return;
  initialized = true;
  try {
    const dbOk = await initDatabase();
    if (dbOk) {
      await connectRedis();
      try {
        await SeatService.syncAllSeats();
      } catch (syncErr: any) {
        console.warn('[Seats] Sync warning:', syncErr.message);
      }
    }
  } catch (err: any) {
    initError = err.message;
    console.error('[Init] Initialization error:', err.message);
    // Reset so next request retries
    initialized = false;
  }
};

// Initialization middleware — non-blocking, graceful degradation
app.use(async (req, res, next) => {
  if (!initialized) {
    try {
      await initializeApp();
    } catch (err: any) {
      console.error('[Middleware] Init error:', err.message);
      // Allow request through even if init fails
    }
  }
  next();
});

// API Routes
app.use('/api', apiRouter);

// Error Handling Middleware
app.use(errorHandler);

// Only start HTTP server when not in Vercel serverless
if (!process.env.VERCEL) {
  const startServer = async () => {
    console.log('====================================================');
    console.log(' Starting Smart Course Registration & Academic Planner API');
    console.log('====================================================');
    await initializeApp();
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
}

export default app;
