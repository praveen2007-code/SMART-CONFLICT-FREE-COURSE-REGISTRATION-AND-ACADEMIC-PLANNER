import Redis from 'ioredis';
import { ENV } from './env';

// In-memory fallback dictionary for when Redis server is connecting or offline
const memoryStore = new Map<string, string>();

let isRedisConnected = false;

export const redis = new Redis({
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASSWORD,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    if (times > 5) {
      return null; // stop retrying after 5 attempts during offline dev
    }
    return Math.min(times * 500, 2000);
  },
  lazyConnect: true,
});

redis.on('connect', () => {
  isRedisConnected = true;
  console.log(`[Redis] Connected to ${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`);
});

redis.on('error', (err) => {
  isRedisConnected = false;
  // Non-fatal warning so express can still boot during setup
  if (ENV.NODE_ENV === 'development') {
    // Suppress noisy output in dev if redis is not running
  }
});

export const connectRedis = async (): Promise<boolean> => {
  try {
    await redis.connect();
    return true;
  } catch (err: any) {
    console.warn(`[Redis] Notice: Redis not reachable at ${ENV.REDIS_HOST}:${ENV.REDIS_PORT}. Using in-memory fallback layer.`);
    isRedisConnected = false;
    return false;
  }
};

// Safe Redis wrapper functions with fallback
export const safeRedis = {
  isConnected: () => isRedisConnected,

  async get(key: string): Promise<string | null> {
    if (isRedisConnected) {
      try {
        return await redis.get(key);
      } catch {
        // Fall back
      }
    }
    return memoryStore.get(key) ?? null;
  },

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null> {
    if (isRedisConnected) {
      try {
        if (mode === 'EX' && duration) {
          await redis.set(key, value, 'EX', duration);
        } else {
          await redis.set(key, value);
        }
        return 'OK';
      } catch {
        // Fall back
      }
    }
    memoryStore.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => memoryStore.delete(key), duration * 1000);
    }
    return 'OK';
  },

  async setnx(key: string, value: string): Promise<number> {
    if (isRedisConnected) {
      try {
        return await redis.setnx(key, value);
      } catch {
        // Fall back
      }
    }
    if (memoryStore.has(key)) return 0;
    memoryStore.set(key, value);
    return 1;
  },

  async del(key: string): Promise<number> {
    if (isRedisConnected) {
      try {
        return await redis.del(key);
      } catch {
        // Fall back
      }
    }
    const had = memoryStore.has(key);
    memoryStore.delete(key);
    return had ? 1 : 0;
  },

  async incr(key: string): Promise<number> {
    if (isRedisConnected) {
      try {
        return await redis.incr(key);
      } catch {
        // Fall back
      }
    }
    const current = parseInt(memoryStore.get(key) || '0', 10);
    const next = current + 1;
    memoryStore.set(key, next.toString());
    return next;
  },

  async decr(key: string): Promise<number> {
    if (isRedisConnected) {
      try {
        return await redis.decr(key);
      } catch {
        // Fall back
      }
    }
    const current = parseInt(memoryStore.get(key) || '0', 10);
    const next = current - 1;
    memoryStore.set(key, next.toString());
    return next;
  },

  async expire(key: string, seconds: number): Promise<number> {
    if (isRedisConnected) {
      try {
        return await redis.expire(key, seconds);
      } catch {
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
