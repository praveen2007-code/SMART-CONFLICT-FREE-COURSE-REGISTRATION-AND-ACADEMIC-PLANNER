"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeRedis = exports.connectRedis = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
// In-memory fallback dictionary for when Redis server is connecting or offline
const memoryStore = new Map();
let isRedisConnected = false;
exports.redis = new ioredis_1.default({
    host: env_1.ENV.REDIS_HOST,
    port: env_1.ENV.REDIS_PORT,
    password: env_1.ENV.REDIS_PASSWORD,
    tls: env_1.ENV.REDIS_TLS ? {} : undefined,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
        if (times > 5) {
            return null; // stop retrying after 5 attempts during offline dev
        }
        return Math.min(times * 500, 2000);
    },
    lazyConnect: true,
});
exports.redis.on('connect', () => {
    isRedisConnected = true;
    console.log(`[Redis] Connected to ${env_1.ENV.REDIS_HOST}:${env_1.ENV.REDIS_PORT}`);
});
exports.redis.on('error', (err) => {
    isRedisConnected = false;
    // Non-fatal warning so express can still boot during setup
    if (env_1.ENV.NODE_ENV === 'development') {
        // Suppress noisy output in dev if redis is not running
    }
});
const connectRedis = async () => {
    try {
        await exports.redis.connect();
        return true;
    }
    catch (err) {
        console.warn(`[Redis] Notice: Redis not reachable at ${env_1.ENV.REDIS_HOST}:${env_1.ENV.REDIS_PORT}. Using in-memory fallback layer.`);
        isRedisConnected = false;
        return false;
    }
};
exports.connectRedis = connectRedis;
// Safe Redis wrapper functions with fallback
exports.safeRedis = {
    isConnected: () => isRedisConnected,
    async get(key) {
        if (isRedisConnected) {
            try {
                return await exports.redis.get(key);
            }
            catch {
                // Fall back
            }
        }
        return memoryStore.get(key) ?? null;
    },
    async set(key, value, mode, duration) {
        if (isRedisConnected) {
            try {
                if (mode === 'EX' && duration) {
                    await exports.redis.set(key, value, 'EX', duration);
                }
                else {
                    await exports.redis.set(key, value);
                }
                return 'OK';
            }
            catch {
                // Fall back
            }
        }
        memoryStore.set(key, value);
        if (mode === 'EX' && duration) {
            setTimeout(() => memoryStore.delete(key), duration * 1000);
        }
        return 'OK';
    },
    async setnx(key, value) {
        if (isRedisConnected) {
            try {
                return await exports.redis.setnx(key, value);
            }
            catch {
                // Fall back
            }
        }
        if (memoryStore.has(key))
            return 0;
        memoryStore.set(key, value);
        return 1;
    },
    async del(key) {
        if (isRedisConnected) {
            try {
                return await exports.redis.del(key);
            }
            catch {
                // Fall back
            }
        }
        const had = memoryStore.has(key);
        memoryStore.delete(key);
        return had ? 1 : 0;
    },
    async incr(key) {
        if (isRedisConnected) {
            try {
                return await exports.redis.incr(key);
            }
            catch {
                // Fall back
            }
        }
        const current = parseInt(memoryStore.get(key) || '0', 10);
        const next = current + 1;
        memoryStore.set(key, next.toString());
        return next;
    },
    async decr(key) {
        if (isRedisConnected) {
            try {
                return await exports.redis.decr(key);
            }
            catch {
                // Fall back
            }
        }
        const current = parseInt(memoryStore.get(key) || '0', 10);
        const next = current - 1;
        memoryStore.set(key, next.toString());
        return next;
    },
    async expire(key, seconds) {
        if (isRedisConnected) {
            try {
                return await exports.redis.expire(key, seconds);
            }
            catch {
                // Fall back
            }
        }
        if (memoryStore.has(key)) {
            setTimeout(() => memoryStore.delete(key), seconds * 1000);
            return 1;
        }
        return 0;
    }
};
