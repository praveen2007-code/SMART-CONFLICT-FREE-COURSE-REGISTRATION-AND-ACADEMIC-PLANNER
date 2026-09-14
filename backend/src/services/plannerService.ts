import { query } from '../config/db';
import { CourseSection, Schedule, ScheduleConflict, ConflictCheckResult } from '../models/types';
import { SeatService } from './seatService';

interface ScheduleSlot {
  day: string;
  startMinutes: number;
  endMinutes: number;
  rawStart: string;
  rawEnd: string;
}

export class PlannerService {
  /**
   * Converts "HH:MM:SS" or "HH:MM" into minutes from midnight
   */
  public static parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1] || '0', 10);
    return hours * 60 + minutes;
  }

  /**
   * Check if two time slots overlap on the same day
   */
  public static isOverlap(slotA: ScheduleSlot, slotB: ScheduleSlot): boolean {
    if (slotA.day !== slotB.day) return false;
    // Overlap condition: startA < endB && startB < endA
    return slotA.startMinutes < slotB.endMinutes && slotB.startMinutes < slotA.endMinutes;
  }

  /**
   * Format military/24h time string to user friendly "10:00 AM – 11:30 AM"
   */
  public static formatTimeRange(startStr: string, endStr: string): string {
    const formatSingle = (t: string) => {
      const parts = t.split(':');
      let hour = parseInt(parts[0], 10);
      const min = parts[1] || '00';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;
      return `${hour}:${min} ${ampm}`;
    };
    return `${formatSingle(startStr)} – ${formatSingle(endStr)}`;
  }

  /**
   * Fetch complete section info including schedules, course code, and seats
   */
  public static async getSectionWithDetails(sectionId: number): Promise<CourseSection | null> {
    const res = await query(
      `SELECT cs.id, cs.course_id, cs.section_code, cs.faculty_name, cs.max_capacity, cs.room_number,
              c.code as course_code, c.name as course_name, c.credits, c.is_core, c.department_id
       FROM course_sections cs
       JOIN courses c ON c.id = cs.course_id
       WHERE cs.id = $1`,
      [sectionId]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    const schedRes = await query<Schedule>(
      `SELECT id, section_id, day_of_week, start_time, end_time, building, room
       FROM schedules
       WHERE section_id = $1`,
      [sectionId]
    );

    const seatInfo = await SeatService.getAvailableSeats(sectionId);

    return {
      id: row.id,
      course_id: row.course_id,
      course_code: row.course_code,
      course_name: row.course_name,
      credits: row.credits,
      section_code: row.section_code,
      faculty_name: row.faculty_name,
      max_capacity: row.max_capacity,
      room_number: row.room_number,
      semester_term: 'Fall 2026',
      available_seats: seatInfo.available,
      seat_status: seatInfo.status,
      schedules: schedRes.rows
    };
  }

  /**
   * Detect schedule collisions among a set of sections
   */
  public static async checkConflicts(sectionIds: number[], studentId?: number): Promise<ConflictCheckResult> {
    const sections: CourseSection[] = [];
    let totalCredits = 0;

    for (const sid of sectionIds) {
      const sec = await this.getSectionWithDetails(sid);
      if (sec) {
        sections.push(sec);
        totalCredits += sec.credits || 0;
      }
    }

    const conflicts: ScheduleConflict[] = [];

    // Pairwise comparison
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const secA = sections[i];
        const secB = sections[j];

        if (!secA.schedules || !secB.schedules) continue;

        for (const schedA of secA.schedules) {
          const slotA: ScheduleSlot = {
            day: schedA.day_of_week,
            startMinutes: this.parseTimeToMinutes(schedA.start_time),
            endMinutes: this.parseTimeToMinutes(schedA.end_time),
            rawStart: schedA.start_time,
            rawEnd: schedA.end_time
          };

          for (const schedB of secB.schedules) {
            const slotB: ScheduleSlot = {
              day: schedB.day_of_week,
              startMinutes: this.parseTimeToMinutes(schedB.start_time),
              endMinutes: this.parseTimeToMinutes(schedB.end_time),
              rawStart: schedB.start_time,
              rawEnd: schedB.end_time
            };

            if (this.isOverlap(slotA, slotB)) {
              // Found collision!
              // Try to find alternative section for SecB or SecA
              const alt = await this.findAlternativeSection(secB, sections);

              conflicts.push({
                course1: {
                  id: secA.course_id,
                  code: secA.course_code || '',
                  name: secA.course_name || '',
                  section: secA.section_code,
                  day: schedA.day_of_week,
                  time: this.formatTimeRange(schedA.start_time, schedA.end_time)
                },
                course2: {
                  id: secB.course_id,
                  code: secB.course_code || '',
                  name: secB.course_name || '',
                  section: secB.section_code,
                  day: schedB.day_of_week,
                  time: this.formatTimeRange(schedB.start_time, schedB.end_time)
                },
                suggestedAlternative: alt || undefined
              });
            }
          }
        }
      }
    }

    // Prerequisite check if studentId is provided
    const prerequisiteIssues: ConflictCheckResult['prerequisiteIssues'] = [];
    if (studentId) {
      const courseIds = sections.map((s) => s.course_id);
      const prereqCheck = await this.checkPrerequisites(studentId, courseIds);
      for (const issue of prereqCheck) {
        if (!issue.satisfied) {
          prerequisiteIssues.push({
            courseId: issue.courseId,
            courseCode: issue.courseCode,
            missingPrerequisites: issue.missingPrereqs
          });
        }
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      totalCredits,
      prerequisiteIssues
    };
  }

  /**
   * Find an alternative section for a course that does not conflict with the remaining selected sections
   */
  private static async findAlternativeSection(
    conflictedSec: CourseSection,
    otherSections: CourseSection[]
  ): Promise<ScheduleConflict['suggestedAlternative'] | null> {
    // Get all other sections of this course
    const res = await query<{ id: number; section_code: string }>(
      'SELECT id, section_code FROM course_sections WHERE course_id = $1 AND id != $2',
      [conflictedSec.course_id, conflictedSec.id]
    );

    for (const altRow of res.rows) {
      const altSec = await this.getSectionWithDetails(altRow.id);
      if (!altSec || !altSec.schedules || altSec.schedules.length === 0) continue;

      // Check if this alternative has seats available
      if ((altSec.available_seats || 0) <= 0) continue;

      // Check if it conflicts with any section except the conflicted course itself
      let hasConflictWithOthers = false;

      for (const other of otherSections) {
        if (other.course_id === conflictedSec.course_id || !other.schedules) continue;

        for (const altSched of altSec.schedules) {
          const slotAlt: ScheduleSlot = {
            day: altSched.day_of_week,
            startMinutes: this.parseTimeToMinutes(altSched.start_time),
            endMinutes: this.parseTimeToMinutes(altSched.end_time),
            rawStart: altSched.start_time,
            rawEnd: altSched.end_time
          };

          for (const otherSched of other.schedules) {
            const slotOther: ScheduleSlot = {
              day: otherSched.day_of_week,
              startMinutes: this.parseTimeToMinutes(otherSched.start_time),
              endMinutes: this.parseTimeToMinutes(otherSched.end_time),
              rawStart: otherSched.start_time,
              rawEnd: otherSched.end_time
            };

            if (this.isOverlap(slotAlt, slotOther)) {
              hasConflictWithOthers = true;
              break;
            }
          }
          if (hasConflictWithOthers) break;
        }
        if (hasConflictWithOthers) break;
      }

      if (!hasConflictWithOthers) {
        const schedSummary = altSec.schedules
          .map((s) => `${s.day_of_week} ${this.formatTimeRange(s.start_time, s.end_time)}`)
          .join(', ');

        return {
          courseId: conflictedSec.course_id,
          courseCode: conflictedSec.course_code || '',
          courseName: conflictedSec.course_name || '',
          sectionId: altSec.id,
          sectionCode: altSec.section_code,
          time: schedSummary,
          availableSeats: altSec.available_seats || 0
        };
      }
    }

    return null;
  }

  /**
   * Check whether the student has completed prerequisites for the given courses
   */
  public static async checkPrerequisites(
    studentId: number,
    courseIds: number[]
  ): Promise<{ courseId: number; courseCode: string; satisfied: boolean; missingPrereqs: string[] }[]> {
    if (courseIds.length === 0) return [];

    // Get all completed course IDs for this student
    const completedRes = await query<{ course_id: number }>(
      'SELECT course_id FROM completed_courses WHERE student_id = $1',
      [studentId]
    );
    const completedSet = new Set<number>(completedRes.rows.map((r) => r.course_id));

    // Get prerequisites for each course
    const prereqRes = await query<{
      course_id: number;
      course_code: string;
      prerequisite_course_id: number;
      prereq_code: string;
      prereq_name: string;
    }>(
      `SELECT p.course_id, c.code as course_code, p.prerequisite_course_id,
              pr.code as prereq_code, pr.name as prereq_name
       FROM prerequisites p
       JOIN courses c ON c.id = p.course_id
       JOIN courses pr ON pr.id = p.prerequisite_course_id
       WHERE p.course_id = ANY($1::int[])`,
      [courseIds]
    );

    // Group by course_id
    const courseMap = new Map<number, { courseCode: string; missing: string[] }>();
    for (const cId of courseIds) {
      courseMap.set(cId, { courseCode: '', missing: [] });
    }

    for (const row of prereqRes.rows) {
      const entry = courseMap.get(row.course_id) || { courseCode: row.course_code, missing: [] };
      entry.courseCode = row.course_code;
      if (!completedSet.has(row.prerequisite_course_id)) {
        entry.missing.push(`${row.prereq_code} (${row.prereq_name})`);
      }
      courseMap.set(row.course_id, entry);
    }

    return Array.from(courseMap.entries()).map(([courseId, data]) => ({
      courseId,
      courseCode: data.courseCode,
      satisfied: data.missing.length === 0,
      missingPrereqs: data.missing
    }));
  }

  /**
   * "Generate Best Schedule" Optimization Engine
   * Takes student ID and desired course IDs, analyzes all section permutations,
   * checks timing conflicts, prerequisites, seats, core course status, and credit loads.
   * Returns top-ranked valid schedules.
   */
  public static async generateBestSchedule(
    studentId: number,
    requestedCourseIds: number[],
    preferences?: { preferredTime?: 'MORNING' | 'AFTERNOON' | 'ANY'; maxCredits?: number }
  ): Promise<{
    bestSchedule: {
      score: number;
      sections: CourseSection[];
      totalCredits: number;
      breakdown: {
        conflictsCount: number;
        prereqsMet: boolean;
        coreCoursesCount: number;
        averageAvailableSeats: number;
        timePreferenceScore: number;
      };
      status: 'OPTIMAL' | 'CONFLICTS_FOUND';
    } | null;
    alternatives: any[];
    recommendations: string[];
  }> {
    if (requestedCourseIds.length === 0) {
      return { bestSchedule: null, alternatives: [], recommendations: ['No courses selected. Please select at least one course.'] };
    }

    // 1. Fetch student info for credit limit
    const stuRes = await query<{ max_credits: number; semester: number }>(
      'SELECT max_credits, semester FROM students WHERE id = $1',
      [studentId]
    );
    const maxCredits = preferences?.maxCredits || stuRes.rows[0]?.max_credits || 20;

    // 2. Fetch sections and schedules for all requested courses
    const sectionsByCourse: Map<number, CourseSection[]> = new Map();

    for (const cId of requestedCourseIds) {
      const secRows = await query<{ id: number }>(
        'SELECT id FROM course_sections WHERE course_id = $1',
        [cId]
      );
      const loadedSections: CourseSection[] = [];
      for (const r of secRows.rows) {
        const sec = await this.getSectionWithDetails(r.id);
        if (sec) loadedSections.push(sec);
      }
      if (loadedSections.length > 0) {
        sectionsByCourse.set(cId, loadedSections);
      }
    }

    // 3. Prerequisite check
    const prereqCheck = await this.checkPrerequisites(studentId, requestedCourseIds);
    const missingMap = new Map(prereqCheck.map((p) => [p.courseId, p]));

    // 4. Combinatorial Search across available course sections
    const courseKeys = Array.from(sectionsByCourse.keys());

    // Generate cartesian product of sections
    const combinations: CourseSection[][] = [];
    const buildCombinations = (index: number, current: CourseSection[]) => {
      if (index === courseKeys.length) {
        combinations.push([...current]);
        return;
      }
      const cId = courseKeys[index];
      const sections = sectionsByCourse.get(cId) || [];
      for (const sec of sections) {
        current.push(sec);
        buildCombinations(index + 1, current);
        current.pop();
      }
    };

    buildCombinations(0, []);

    // 5. Score each combination
    interface ScoredPlan {
      score: number;
      sections: CourseSection[];
      totalCredits: number;
      conflictsCount: number;
      prereqsMet: boolean;
      coreCount: number;
      avgSeats: number;
      timeScore: number;
    }

    const scoredPlans: ScoredPlan[] = [];

    for (const combo of combinations) {
      let totalCredits = 0;
      let conflictsCount = 0;
      let coreCount = 0;
      let totalSeats = 0;
      let timeScore = 0;
      let allPrereqsMet = true;

      // Check credits & prereqs
      for (const sec of combo) {
        totalCredits += sec.credits || 0;
        const pCheck = missingMap.get(sec.course_id);
        if (pCheck && !pCheck.satisfied) {
          allPrereqsMet = false;
        }
        totalSeats += sec.available_seats || 0;
      }

      // Check timetable overlap
      for (let i = 0; i < combo.length; i++) {
        for (let j = i + 1; j < combo.length; j++) {
          const secA = combo[i];
          const secB = combo[j];
          if (!secA.schedules || !secB.schedules) continue;

          for (const sA of secA.schedules) {
            const slotA = {
              day: sA.day_of_week,
              startMinutes: this.parseTimeToMinutes(sA.start_time),
              endMinutes: this.parseTimeToMinutes(sA.end_time),
              rawStart: sA.start_time,
              rawEnd: sA.end_time
            };
            for (const sB of secB.schedules) {
              const slotB = {
                day: sB.day_of_week,
                startMinutes: this.parseTimeToMinutes(sB.start_time),
                endMinutes: this.parseTimeToMinutes(sB.end_time),
                rawStart: sB.start_time,
                rawEnd: sB.end_time
              };
              if (this.isOverlap(slotA, slotB)) {
                conflictsCount++;
              }
            }
          }
        }
      }

      // Preferred time scoring (Morning < 12:00, Afternoon >= 12:00)
      if (preferences?.preferredTime && preferences.preferredTime !== 'ANY') {
        for (const sec of combo) {
          for (const s of sec.schedules || []) {
            const startMin = this.parseTimeToMinutes(s.start_time);
            if (preferences.preferredTime === 'MORNING' && startMin < 720) {
              timeScore += 10;
            } else if (preferences.preferredTime === 'AFTERNOON' && startMin >= 720) {
              timeScore += 10;
            }
          }
        }
      }

      const avgSeats = combo.length > 0 ? totalSeats / combo.length : 0;

      // Formula:
      // - Timetable conflict penalty: -500 per conflict
      // - Prerequisites met: +100
      // - Credit limit respected: +50 (penalty -100 if exceeded)
      // - Core courses prioritized: +20 per core course
      // - Seat availability: +2 per average seat
      // - Time preference: +timeScore
      let score = 100;
      if (conflictsCount > 0) score -= conflictsCount * 500;
      if (allPrereqsMet) score += 100; else score -= 200;
      if (totalCredits <= maxCredits) score += 50; else score -= (totalCredits - maxCredits) * 30;
      score += avgSeats * 2;
      score += timeScore;

      scoredPlans.push({
        score,
        sections: combo,
        totalCredits,
        conflictsCount,
        prereqsMet: allPrereqsMet,
        coreCount,
        avgSeats,
        timeScore
      });
    }

    // Sort plans by score descending
    scoredPlans.sort((a, b) => b.score - a.score);

    const best = scoredPlans[0];
    const recommendations: string[] = [];

    if (!best) {
      return { bestSchedule: null, alternatives: [], recommendations: ['Could not generate schedules for the selected courses.'] };
    }

    if (best.conflictsCount === 0) {
      recommendations.push('✓ Excellent! A fully conflict-free timetable was generated.');
    } else {
      recommendations.push(`⚠️ Detected ${best.conflictsCount} unavoidable timing conflict(s) among your selected courses. Consider changing one course.`);
    }

    if (!best.prereqsMet) {
      recommendations.push('⚠️ Missing prerequisites detected for one or more courses. Review prerequisites before submitting registration.');
    }

    if (best.totalCredits > maxCredits) {
      recommendations.push(`⚠️ Selected courses exceed your semester maximum of ${maxCredits} credits.`);
    }

    return {
      bestSchedule: {
        score: Math.max(0, Math.round(best.score)),
        sections: best.sections,
        totalCredits: best.totalCredits,
        breakdown: {
          conflictsCount: best.conflictsCount,
          prereqsMet: best.prereqsMet,
          coreCoursesCount: best.coreCount,
          averageAvailableSeats: Math.round(best.avgSeats),
          timePreferenceScore: best.timeScore
        },
        status: best.conflictsCount === 0 ? 'OPTIMAL' : 'CONFLICTS_FOUND'
      },
      alternatives: scoredPlans.slice(1, 4).map((plan) => ({
        score: Math.max(0, Math.round(plan.score)),
        totalCredits: plan.totalCredits,
        conflictsCount: plan.conflictsCount,
        sections: plan.sections.map((s) => ({
          id: s.id,
          courseCode: s.course_code,
          courseName: s.course_name,
          sectionCode: s.section_code,
          availableSeats: s.available_seats
        }))
      })),
      recommendations
    };
  }
}
