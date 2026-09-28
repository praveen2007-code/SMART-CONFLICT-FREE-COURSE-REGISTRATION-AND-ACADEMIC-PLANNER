import { CourseSection as CourseSectionModel, Course, Student, CompletedCourse } from '../models';
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
    const sec = await CourseSectionModel.findOne({ id: sectionId });
    if (!sec) return null;

    const c = await Course.findOne({ id: sec.course_id });
    const seatInfo = await SeatService.getAvailableSeats(sectionId);

    return {
      id: sec.id,
      course_id: sec.course_id,
      course_code: c?.code || 'UNKNOWN',
      course_name: c?.name || 'Unknown Course',
      credits: c?.credits || 3,
      section_code: sec.section_code,
      faculty_name: sec.faculty_name,
      max_capacity: sec.max_capacity,
      room_number: sec.room_number,
      semester_term: sec.semester_term || 'Fall 2026',
      available_seats: seatInfo.available,
      seat_status: seatInfo.status,
      schedules: (sec.schedules || []) as Schedule[]
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

    // Compare each section pair
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const secA = sections[i];
        const secB = sections[j];

        if (!secA.schedules || !secB.schedules) continue;

        for (const schedA of secA.schedules) {
          for (const schedB of secB.schedules) {
            const slotA: ScheduleSlot = {
              day: schedA.day_of_week,
              startMinutes: this.parseTimeToMinutes(schedA.start_time),
              endMinutes: this.parseTimeToMinutes(schedA.end_time),
              rawStart: schedA.start_time,
              rawEnd: schedA.end_time
            };

            const slotB: ScheduleSlot = {
              day: schedB.day_of_week,
              startMinutes: this.parseTimeToMinutes(schedB.start_time),
              endMinutes: this.parseTimeToMinutes(schedB.end_time),
              rawStart: schedB.start_time,
              rawEnd: schedB.end_time
            };

            if (this.isOverlap(slotA, slotB)) {
              // Try to find alternative section for secB that does not collide with secA and others
              const suggestedAlt = await this.findAlternativeSection(secB, sections);

              conflicts.push({
                course1: {
                  id: secA.id,
                  code: secA.course_code || 'Unknown',
                  name: secA.course_name || 'Unknown',
                  section: secA.section_code,
                  day: schedA.day_of_week,
                  time: this.formatTimeRange(schedA.start_time, schedA.end_time)
                },
                course2: {
                  id: secB.id,
                  code: secB.course_code || 'Unknown',
                  name: secB.course_name || 'Unknown',
                  section: secB.section_code,
                  day: schedB.day_of_week,
                  time: this.formatTimeRange(schedB.start_time, schedB.end_time)
                },
                overlapDay: schedA.day_of_week,
                overlapTime: `${this.formatTimeRange(
                  Math.max(slotA.startMinutes, slotB.startMinutes) === slotA.startMinutes ? schedA.start_time : schedB.start_time,
                  Math.min(slotA.endMinutes, slotB.endMinutes) === slotA.endMinutes ? schedA.end_time : schedB.end_time
                )}`,
                suggestedAlternative: suggestedAlt || undefined
              });
            }
          }
        }
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      totalCredits,
      prerequisiteIssues: []
    };
  }

  /**
   * Find an alternative section for a conflicted course that resolves the collision
   */
  private static async findAlternativeSection(
    conflictedSec: CourseSection,
    otherSections: CourseSection[]
  ): Promise<ScheduleConflict['suggestedAlternative'] | null> {
    const altSections = await CourseSectionModel.find({
      course_id: conflictedSec.course_id,
      id: { $ne: conflictedSec.id }
    });

    for (const altRow of altSections) {
      const altSec = await this.getSectionWithDetails(altRow.id);
      if (!altSec || !altSec.schedules || altSec.schedules.length === 0) continue;

      if ((altSec.available_seats || 0) <= 0) continue;

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
        const firstSched = altSec.schedules[0];
        const days = Array.from(new Set(altSec.schedules.map((s: any) => s.day_of_week))).join('/');
        return {
          courseId: altSec.course_id,
          courseCode: altSec.course_code || '',
          courseName: altSec.course_name || '',
          sectionId: altSec.id,
          sectionCode: altSec.section_code,
          time: `${days} ${this.formatTimeRange(firstSched.start_time, firstSched.end_time)}`,
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

    const completed = await CompletedCourse.find({ student_id: studentId });
    const completedSet = new Set<number>(completed.map((r: any) => r.course_id));

    const courses = await Course.find({ id: { $in: courseIds } });
    const allCourses = await Course.find();
    const courseMap = new Map<number, any>();
    allCourses.forEach((c: any) => courseMap.set(c.id, c));

    return courses.map((c: any) => {
      const missing: string[] = [];
      for (const pId of c.prerequisites || []) {
        if (!completedSet.has(pId)) {
          const pInfo = courseMap.get(pId);
          missing.push(`${pInfo?.code || `C-${pId}`} (${pInfo?.name || 'Prerequisite'})`);
        }
      }

      return {
        courseId: c.id,
        courseCode: c.code,
        satisfied: missing.length === 0,
        missingPrereqs: missing
      };
    });
  }

  /**
   * "Generate Best Schedule" Optimization Engine
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

    const stu = await Student.findOne({ id: studentId });
    const maxCredits = preferences?.maxCredits || stu?.max_credits || 20;

    const sectionsByCourse: Map<number, CourseSection[]> = new Map();

    for (const cId of requestedCourseIds) {
      const secRows = await CourseSectionModel.find({ course_id: cId });
      const loadedSections: CourseSection[] = [];
      for (const r of secRows) {
        const sec = await this.getSectionWithDetails(r.id);
        if (sec) loadedSections.push(sec);
      }
      if (loadedSections.length > 0) {
        sectionsByCourse.set(cId, loadedSections);
      }
    }

    const prereqCheck = await this.checkPrerequisites(studentId, requestedCourseIds);
    const missingMap = new Map(prereqCheck.map((p) => [p.courseId, p]));

    const courseKeys = Array.from(sectionsByCourse.keys());

    function getCartesian(arrays: CourseSection[][]): CourseSection[][] {
      return arrays.reduce<CourseSection[][]>(
        (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
        [[]]
      );
    }

    const sectionArrays = courseKeys.map((cId) => sectionsByCourse.get(cId) || []);
    const permutations = getCartesian(sectionArrays);

    const scoredSchedules: any[] = [];

    for (const perm of permutations) {
      const sectionIds = perm.map((s) => s.id);
      const conflictRes = await this.checkConflicts(sectionIds);
      const credits = perm.reduce((acc, s) => acc + (s.credits || 0), 0);

      if (credits > maxCredits) continue;

      let score = 100;
      score -= conflictRes.conflicts.length * 50;

      let allPrereqsMet = true;
      for (const sec of perm) {
        const pCheck = missingMap.get(sec.course_id);
        if (pCheck && !pCheck.satisfied) {
          allPrereqsMet = false;
          score -= 30;
        }
      }

      let totalSeats = 0;
      for (const sec of perm) {
        const seats = sec.available_seats || 0;
        totalSeats += seats;
        if (seats <= 0) score -= 40;
        else if (seats <= 5) score -= 10;
        else score += 5;
      }
      const avgSeats = perm.length > 0 ? Math.round(totalSeats / perm.length) : 0;

      let timePrefScore = 0;
      if (preferences?.preferredTime && preferences.preferredTime !== 'ANY') {
        for (const sec of perm) {
          for (const sched of sec.schedules || []) {
            const startHour = parseInt(sched.start_time.split(':')[0], 10);
            if (preferences.preferredTime === 'MORNING' && startHour < 12) {
              timePrefScore += 5;
            } else if (preferences.preferredTime === 'AFTERNOON' && startHour >= 12) {
              timePrefScore += 5;
            }
          }
        }
      }
      score += timePrefScore;

      scoredSchedules.push({
        score: Math.max(0, score),
        sections: perm,
        totalCredits: credits,
        conflictsCount: conflictRes.conflicts.length,
        conflicts: conflictRes.conflicts,
        breakdown: {
          conflictsCount: conflictRes.conflicts.length,
          prereqsMet: allPrereqsMet,
          coreCoursesCount: perm.filter((s) => (s as any).is_core).length,
          averageAvailableSeats: avgSeats,
          timePreferenceScore: timePrefScore
        },
        status: conflictRes.conflicts.length === 0 ? 'OPTIMAL' : 'CONFLICTS_FOUND'
      });
    }

    scoredSchedules.sort((a, b) => b.score - a.score);

    const best = scoredSchedules[0] || null;
    const alternatives = scoredSchedules.slice(1, 4);

    const recommendations: string[] = [];
    if (best) {
      if (best.conflictsCount === 0) {
        recommendations.push('✨ Optimal schedule identified! Zero timetable conflicts detected.');
      } else {
        recommendations.push(`⚠️ Selected courses have timing overlaps. Try alternate sections.`);
      }
      for (const [, pCheck] of missingMap) {
        if (!pCheck.satisfied) {
          recommendations.push(`Prerequisite Alert: ${pCheck.courseCode} requires completion of: ${pCheck.missingPrereqs.join(', ')}.`);
        }
      }
    }

    return {
      bestSchedule: best,
      alternatives,
      recommendations
    };
  }
}
