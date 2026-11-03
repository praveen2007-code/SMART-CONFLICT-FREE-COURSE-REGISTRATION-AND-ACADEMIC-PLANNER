"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatService = void 0;
const redis_1 = require("../config/redis");
const models_1 = require("../models");
class SeatService {
    static getKey(sectionId) {
        return `section:${sectionId}:seats_available`;
    }
    static getLockKey(studentId, sectionId) {
        return `lock:registration:${studentId}:${sectionId}`;
    }
    /**
     * Determine visual seat status badge
     */
    static calculateStatus(available, capacity) {
        if (available <= 0)
            return 'FULL';
        if (available <= 5 || available <= Math.ceil(capacity * 0.15))
            return 'ALMOST_FULL';
        return 'AVAILABLE';
    }
    /**
     * Get available seats from Redis (with MongoDB fallback if not cached)
     */
    static async getAvailableSeats(sectionId) {
        const key = this.getKey(sectionId);
        const cached = await redis_1.safeRedis.get(key);
        if (cached !== null) {
            const available = parseInt(cached, 10);
            const section = await models_1.CourseSection.findOne({ id: sectionId });
            const capacity = section?.max_capacity || 30;
            return {
                available: Math.max(0, available),
                capacity,
                status: this.calculateStatus(available, capacity)
            };
        }
        // Cache miss: calculate from MongoDB
        const section = await models_1.CourseSection.findOne({ id: sectionId });
        if (!section) {
            return { available: 0, capacity: 0, status: 'FULL' };
        }
        const enrolled = await models_1.Enrollment.countDocuments({ section_id: sectionId, status: 'REGISTERED' });
        const capacity = section.max_capacity;
        const available = Math.max(0, capacity - enrolled);
        // Cache in Redis for 10 minutes
        await redis_1.safeRedis.set(key, available.toString(), 'EX', 600);
        return {
            available,
            capacity,
            status: this.calculateStatus(available, capacity)
        };
    }
    /**
     * Concurrency Safe Seat Reservation
     * Uses Redis atomic DECR and idempotency lock key
     */
    static async reserveSeat(studentId, sectionId) {
        const lockKey = this.getLockKey(studentId, sectionId);
        // 1. Check idempotency lock to prevent double-click / rapid concurrent submissions
        const acquiredLock = await redis_1.safeRedis.setnx(lockKey, '1');
        if (!acquiredLock) {
            return { success: false, message: 'Registration in progress. Please wait a moment.' };
        }
        await redis_1.safeRedis.expire(lockKey, 10); // 10-second guard
        // 2. Ensure seat counter is initialized in Redis
        const key = this.getKey(sectionId);
        const cached = await redis_1.safeRedis.get(key);
        if (cached === null) {
            await this.getAvailableSeats(sectionId);
        }
        // 3. Atomically decrement seats in Redis
        const remaining = await redis_1.safeRedis.decr(key);
        if (remaining < 0) {
            // Rollback Redis count because section is full
            await redis_1.safeRedis.incr(key);
            await redis_1.safeRedis.del(lockKey);
            return { success: false, message: 'Course section is full. No seats available.' };
        }
        return { success: true };
    }
    /**
     * Release seat in Redis when a student drops the course
     */
    static async releaseSeat(sectionId) {
        const key = this.getKey(sectionId);
        await redis_1.safeRedis.incr(key);
    }
    /**
     * Release registration lock manually
     */
    static async releaseLock(studentId, sectionId) {
        const lockKey = this.getLockKey(studentId, sectionId);
        await redis_1.safeRedis.del(lockKey);
    }
    /**
     * Invalidate and synchronize all section seat counts from MongoDB into Redis
     */
    static async syncAllSeats() {
        try {
            const sections = await models_1.CourseSection.find();
            for (const sec of sections) {
                const enrolled = await models_1.Enrollment.countDocuments({ section_id: sec.id, status: 'REGISTERED' });
                const available = Math.max(0, sec.max_capacity - enrolled);
                await redis_1.safeRedis.set(this.getKey(sec.id), available.toString(), 'EX', 3600);
            }
            console.log(`[Redis Seat Sync] Synced ${sections.length} course sections from MongoDB.`);
        }
        catch (err) {
            console.warn('[Redis Seat Sync] Failed to sync seats:', err.message);
        }
    }
}
exports.SeatService = SeatService;
