import { safeRedis } from '../config/redis';
import { query } from '../config/db';

export type SeatStatus = 'AVAILABLE' | 'ALMOST_FULL' | 'FULL';

export class SeatService {
  private static getKey(sectionId: number): string {
    return `section:${sectionId}:seats_available`;
  }

  private static getLockKey(studentId: number, sectionId: number): string {
    return `lock:registration:${studentId}:${sectionId}`;
  }

  /**
   * Determine visual seat status badge
   */
  public static calculateStatus(available: number, capacity: number): SeatStatus {
    if (available <= 0) return 'FULL';
    if (available <= 5 || available <= Math.ceil(capacity * 0.15)) return 'ALMOST_FULL';
    return 'AVAILABLE';
  }

  /**
   * Get available seats from Redis (with DB fallback if not cached)
   */
  public static async getAvailableSeats(sectionId: number): Promise<{ available: number; capacity: number; status: SeatStatus }> {
    const key = this.getKey(sectionId);
    const cached = await safeRedis.get(key);

    if (cached !== null) {
      const available = parseInt(cached, 10);
      // Fetch capacity from DB if not already stored or cached
      const secRes = await query<{ max_capacity: number }>(
        'SELECT max_capacity FROM course_sections WHERE id = $1',
        [sectionId]
      );
      const capacity = secRes.rows[0]?.max_capacity || 30;
      return {
        available: Math.max(0, available),
        capacity,
        status: this.calculateStatus(available, capacity)
      };
    }

    // Cache miss: calculate from PostgreSQL
    const res = await query<{ max_capacity: number; enrolled_count: string }>(
      `SELECT cs.max_capacity,
              COUNT(e.id) FILTER (WHERE e.status = 'REGISTERED') as enrolled_count
       FROM course_sections cs
       LEFT JOIN enrollments e ON e.section_id = cs.id
       WHERE cs.id = $1
       GROUP BY cs.id`,
      [sectionId]
    );

    if (res.rows.length === 0) {
      return { available: 0, capacity: 0, status: 'FULL' };
    }

    const capacity = res.rows[0].max_capacity;
    const enrolled = parseInt(res.rows[0].enrolled_count || '0', 10);
    const available = Math.max(0, capacity - enrolled);

    // Cache in Redis for 10 minutes
    await safeRedis.set(key, available.toString(), 'EX', 600);

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
  public static async reserveSeat(studentId: number, sectionId: number): Promise<{ success: boolean; message?: string }> {
    const lockKey = this.getLockKey(studentId, sectionId);

    // 1. Check idempotency lock to prevent double-click / rapid concurrent submissions
    const acquiredLock = await safeRedis.setnx(lockKey, '1');
    if (!acquiredLock) {
      return { success: false, message: 'Registration in progress. Please wait a moment.' };
    }
    await safeRedis.expire(lockKey, 10); // 10-second guard

    // 2. Ensure seat counter is initialized in Redis
    const key = this.getKey(sectionId);
    const cached = await safeRedis.get(key);
    if (cached === null) {
      await this.getAvailableSeats(sectionId);
    }

    // 3. Atomically decrement seats in Redis
    const remaining = await safeRedis.decr(key);

    if (remaining < 0) {
      // Rollback Redis count because section is full
      await safeRedis.incr(key);
      await safeRedis.del(lockKey);
      return { success: false, message: 'Course section is full. No seats available.' };
    }

    return { success: true };
  }

  /**
   * Release seat in Redis when a student drops the course
   */
  public static async releaseSeat(sectionId: number): Promise<void> {
    const key = this.getKey(sectionId);
    await safeRedis.incr(key);
  }

  /**
   * Release registration lock manually
   */
  public static async releaseLock(studentId: number, sectionId: number): Promise<void> {
    const lockKey = this.getLockKey(studentId, sectionId);
    await safeRedis.del(lockKey);
  }

  /**
   * Invalidate and synchronize all section seat counts from PostgreSQL into Redis
   */
  public static async syncAllSeats(): Promise<void> {
    try {
      const res = await query<{ id: number; max_capacity: number; enrolled_count: string }>(
        `SELECT cs.id, cs.max_capacity,
                COUNT(e.id) FILTER (WHERE e.status = 'REGISTERED') as enrolled_count
         FROM course_sections cs
         LEFT JOIN enrollments e ON e.section_id = cs.id
         GROUP BY cs.id`
      );

      for (const row of res.rows) {
        const capacity = row.max_capacity;
        const enrolled = parseInt(row.enrolled_count || '0', 10);
        const available = Math.max(0, capacity - enrolled);
        await safeRedis.set(this.getKey(row.id), available.toString(), 'EX', 3600);
      }
      console.log(`[Redis Seat Sync] Synced ${res.rows.length} course sections.`);
    } catch (err: any) {
      console.warn('[Redis Seat Sync] Failed to sync seats:', err.message);
    }
  }
}
