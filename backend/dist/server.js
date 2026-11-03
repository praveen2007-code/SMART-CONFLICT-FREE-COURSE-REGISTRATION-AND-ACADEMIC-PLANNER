"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const seatService_1 = require("./services/seatService");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging in development
if (env_1.ENV.NODE_ENV === 'development') {
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
        environment: env_1.ENV.NODE_ENV
    });
});
// Lazy initialization state
let initialized = false;
let initError = null;
const initializeApp = async () => {
    if (initialized)
        return;
    initialized = true;
    try {
        const dbOk = await (0, db_1.initDatabase)();
        if (dbOk) {
            await (0, redis_1.connectRedis)();
            try {
                await seatService_1.SeatService.syncAllSeats();
            }
            catch (syncErr) {
                console.warn('[Seats] Sync warning:', syncErr.message);
            }
        }
    }
    catch (err) {
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
        }
        catch (err) {
            console.error('[Middleware] Init error:', err.message);
            // Allow request through even if init fails
        }
    }
    next();
});
// API Routes
app.use('/api', routes_1.default);
// Error Handling Middleware
app.use(errorHandler_1.errorHandler);
// Only start HTTP server when not in Vercel serverless
if (!process.env.VERCEL) {
    const startServer = async () => {
        console.log('====================================================');
        console.log(' Starting Smart Course Registration & Academic Planner API');
        console.log('====================================================');
        await initializeApp();
        app.listen(env_1.ENV.PORT, () => {
            console.log(`🚀 Server listening on http://localhost:${env_1.ENV.PORT}`);
            console.log(`📡 REST API available at http://localhost:${env_1.ENV.PORT}/api`);
            console.log(`🩺 Health check at http://localhost:${env_1.ENV.PORT}/api/health`);
            console.log('====================================================');
        });
    };
    startServer().catch((err) => {
        console.error('Fatal bootstrap error:', err);
        process.exit(1);
    });
}
exports.default = app;
