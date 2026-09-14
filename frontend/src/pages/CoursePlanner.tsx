import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { Course, CourseSection, ConflictCheckResponse, GeneratedScheduleResponse } from '../types';
import { ConflictBanner } from '../components/ConflictBanner';
import { TimetableGrid, TimetableItem } from '../components/TimetableGrid';
import { SeatBadge } from '../components/SeatBadge';
import {
  Sparkles,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export const CoursePlanner: React.FC = () => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);

  // Conflict state
  const [conflictReport, setConflictReport] = useState<ConflictCheckResponse | null>(null);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  // Optimizer state
  const [optimizerResult, setOptimizerResult] = useState<GeneratedScheduleResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [preferredTime, setPreferredTime] = useState<'ANY' | 'MORNING' | 'AFTERNOON'>('ANY');

  const [isRegisteringAll, setIsRegisteringAll] = useState(false);

  // 1. Fetch courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.courses.getAll({ studentId: user?.student?.id });
        if (res.success) {
          setCourses(res.courses);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load course list');
      }
    };
    loadCourses();
  }, [user]);

  // 2. Real-time conflict analysis whenever selectedSectionIds changes
  useEffect(() => {
    const analyzeConflicts = async () => {
      if (selectedSectionIds.length < 2) {
        setConflictReport(null);
        return;
      }
      try {
        setIsCheckingConflicts(true);
        const res = await api.planner.checkConflicts(selectedSectionIds, user?.student?.id);
        if (res.success) {
          setConflictReport(res);
        }
      } catch (err: any) {
        console.warn('Conflict check warning:', err.message);
      } finally {
        setIsCheckingConflicts(false);
      }
    };

    analyzeConflicts();
  }, [selectedSectionIds, user]);

  // Toggle course in planner
  const handleToggleCourse = (courseId: number) => {
    const isSelected = selectedCourseIds.includes(courseId);
    if (isSelected) {
      // Remove course and its sections
      setSelectedCourseIds((prev) => prev.filter((id) => id !== courseId));
      const targetCourse = courses.find((c) => c.id === courseId);
      const sectionIdsToRemove = targetCourse?.sections.map((s) => s.id) || [];
      setSelectedSectionIds((prev) => prev.filter((id) => !sectionIdsToRemove.includes(id)));
    } else {
      // Add course and pick its first available section by default
      setSelectedCourseIds((prev) => [...prev, courseId]);
      const targetCourse = courses.find((c) => c.id === courseId);
      if (targetCourse && targetCourse.sections.length > 0) {
        setSelectedSectionIds((prev) => [...prev, targetCourse.sections[0].id]);
      }
    }
  };

  // Switch specific section for a course
  const handleSelectSection = (courseId: number, sectionId: number) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse) return;

    const courseSecIds = targetCourse.sections.map((s) => s.id);
    setSelectedSectionIds((prev) => [
      ...prev.filter((id) => !courseSecIds.includes(id)),
      sectionId
    ]);
  };

  // Switch to recommended alternative section
  const handleApplyAlternative = (alt: { courseId: number; sectionId: number; sectionCode: string }) => {
    handleSelectSection(alt.courseId, alt.sectionId);
    success(`Switched to alternative ${alt.sectionCode}! Checking schedule...`);
  };

  // Preset: Load Classic Overlap Demo (CS301 Sec-A and CS302 Sec-A)
  const loadExampleConflictScenario = () => {
    // CS301 (DBMS, id: 9) Sec-A: MON/WED 10:00-11:30 (id: 5)
    // CS302 (OS, id: 10) Sec-A: MON/WED 10:30-12:00 (id: 7) - CONFLICT!
    // CS303 (Networks, id: 11) Sec-A: MON/WED 14:00-15:30 (id: 9)
    // CS401 (Machine Learning, id: 14) Sec-A: MON/WED 15:30-17:00 (id: 12)
    setSelectedCourseIds([9, 10, 11, 14]);
    setSelectedSectionIds([5, 7, 9, 12]);
    setOptimizerResult(null);
    warning('Loaded demo conflict: DBMS (10:00-11:30) conflicts with Operating Systems (10:30-12:00)!');
  };

  // Clear planner
  const handleClearAll = () => {
    setSelectedCourseIds([]);
    setSelectedSectionIds([]);
    setConflictReport(null);
    setOptimizerResult(null);
  };

  // Run "Generate Best Schedule"
  const handleGenerateBestSchedule = async () => {
    if (selectedCourseIds.length === 0) {
      warning('Please select at least one course to optimize.');
      return;
    }
    try {
      setIsOptimizing(true);
      const res = await api.planner.generateBestSchedule({
        courseIds: selectedCourseIds,
        studentId: user?.student?.id,
        preferences: {
          preferredTime,
          maxCredits: user?.student?.maxCredits
        }
      });
      if (res.success) {
        setOptimizerResult(res);
        if (res.bestSchedule) {
          // Auto-select the optimal sections in UI
          const optimalSectionIds = res.bestSchedule.sections.map((s: CourseSection) => s.id);
          setSelectedSectionIds(optimalSectionIds);
          success('Generated optimal conflict-free schedule combination!');
        }
      }
    } catch (err: any) {
      error(err.message || 'Schedule optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Register for all currently selected sections in planner
  const handleRegisterAll = async () => {
    if (selectedSectionIds.length === 0) return;
    if (conflictReport?.hasConflicts) {
      error('Cannot register with unresolved schedule conflicts. Please resolve conflicts first.');
      return;
    }

    try {
      setIsRegisteringAll(true);
      let registeredCount = 0;
      for (const sId of selectedSectionIds) {
        try {
          const res = await api.registrations.register(sId, user?.student?.id);
          if (res.success) registeredCount++;
        } catch (err: any) {
          error(err.message);
        }
      }
      if (registeredCount > 0) {
        success(`Successfully registered for ${registeredCount} course(s)!`);
      }
    } finally {
      setIsRegisteringAll(false);
    }
  };

  // Build timetable items from selected sections
  const timetableItems: TimetableItem[] = [];
  let currentTotalCredits = 0;

  selectedSectionIds.forEach((secId, cIdx) => {
    for (const course of courses) {
      const sec = course.sections?.find((s) => s.id === secId);
      if (sec) {
        currentTotalCredits += course.credits;
        for (const sched of sec.schedules || []) {
          timetableItems.push({
            courseCode: course.code,
            courseName: course.name,
            sectionCode: sec.sectionCode,
            room: `${sched.building || ''} ${sched.room || ''}`,
            dayOfWeek: sched.day_of_week,
            startTime: sched.start_time,
            endTime: sched.end_time,
            colorIndex: cIdx
          });
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unique Automated Academic Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Smart Conflict-Free Course Planner
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-2 leading-relaxed">
            Select the courses you want to take. Our automated engine checks classroom timings, prerequisites, seat capacities, and credit limits to construct the best possible conflict-free timetable.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={loadExampleConflictScenario}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-slate-950" />
              <span>Load Conflict Demo Scenario</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Planner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Course Selector (Left) vs Real-Time Timetable & Conflict Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Course & Section Selection (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Select Courses to Plan</h3>
                <p className="text-xs text-slate-500">
                  {selectedCourseIds.length} course(s) selected • {currentTotalCredits} credits
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700">
                Max: {user?.student?.maxCredits || 20} cr
              </span>
            </div>

            {/* Time Preference Selector */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Preferred Class Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ANY', 'MORNING', 'AFTERNOON'] as const).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setPreferredTime(pref)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      preferredTime === pref
                        ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pref === 'ANY' ? 'Any Time' : pref === 'MORNING' ? 'Morning' : 'Afternoon'}
                  </button>
                ))}
              </div>
            </div>

            {/* "Generate Best Schedule" Action Button */}
            <button
              type="button"
              disabled={selectedCourseIds.length === 0 || isOptimizing}
              onClick={handleGenerateBestSchedule}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isOptimizing ? 'Analyzing Permutations...' : 'Generate Best Schedule'}</span>
            </button>

            {/* Course Checklist */}
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {courses.map((course) => {
                const isSelected = selectedCourseIds.includes(course.id);
                const activeSectionId = selectedSectionIds.find((sId) =>
                  course.sections.some((s) => s.id === sId)
                );

                return (
                  <div
                    key={course.id}
                    className={`rounded-2xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`course-check-${course.id}`}
                        checked={isSelected}
                        onChange={() => handleToggleCourse(course.id)}
                        className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
                      />
                      <label htmlFor={`course-check-${course.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {course.code}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {course.credits} cr
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">
                          {course.name}
                        </p>
                      </label>
                    </div>

                    {/* If selected, show section switcher */}
                    {isSelected && course.sections && course.sections.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Choose Section:
                        </span>
                        <div className="space-y-1.5">
                          {course.sections.map((sec) => {
                            const isThisSection = activeSectionId === sec.id;
                            return (
                              <button
                                key={sec.id}
                                type="button"
                                onClick={() => handleSelectSection(course.id, sec.id)}
                                className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all border ${
                                  isThisSection
                                    ? 'bg-white border-brand-600 text-brand-900 shadow-2xs font-semibold'
                                    : 'bg-slate-50/80 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <div>
                                  <span className="font-bold">Sec {sec.sectionCode}</span>
                                  <span className="text-[11px] text-slate-500 block font-mono">
                                    {sec.schedules
                                      .map((s) => `${s.day_of_week} ${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}`)
                                      .join(', ')}
                                  </span>
                                </div>
                                <SeatBadge
                                  status={sec.seatStatus}
                                  available={sec.availableSeats}
                                  showCount={true}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Conflict Engine & Timetable Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Conflict Banner Section */}
          {selectedSectionIds.length >= 2 && (
            <div>
              {isCheckingConflicts ? (
                <div className="p-4 rounded-xl bg-slate-100 text-center text-xs text-slate-500 font-medium">
                  Analyzing timetable slot intersections...
                </div>
              ) : (
                <ConflictBanner
                  hasConflicts={conflictReport?.hasConflicts ?? false}
                  conflicts={conflictReport?.conflicts ?? []}
                  onApplyAlternative={handleApplyAlternative}
                />
              )}
            </div>
          )}

          {/* Prerequisite Alert Box if any */}
          {conflictReport?.prerequisiteIssues && conflictReport.prerequisiteIssues.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Prerequisite Requirement Missing</span>
              </div>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                {conflictReport.prerequisiteIssues.map((issue) => (
                  <li key={issue.courseId}>
                    <strong>{issue.courseCode}</strong>: Requires completion of{' '}
                    {issue.missingPrerequisites.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optimization Results Card if Generated */}
          {optimizerResult && optimizerResult.bestSchedule && (
            <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-xs font-bold">
                    <span>Ranked Plan #1 • Score: {optimizerResult.bestSchedule.score}/100</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base mt-1">
                    Optimal Course Combination Generated
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                    {optimizerResult.bestSchedule.breakdown.conflictsCount === 0
                      ? '✓ 0 Conflicts'
                      : `${optimizerResult.bestSchedule.breakdown.conflictsCount} Conflicts`}
                  </span>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800">
                    {optimizerResult.bestSchedule.totalCredits} Credits
                  </span>
                </div>
              </div>

              {/* Recommendations list */}
              <div className="bg-indigo-50/60 rounded-xl p-3.5 space-y-1 text-xs text-indigo-950 font-medium">
                {optimizerResult.recommendations.map((rec, i) => (
                  <p key={i}>{rec}</p>
                ))}
              </div>

              {/* One-click Enroll Button */}
              {optimizerResult.bestSchedule.breakdown.conflictsCount === 0 && (
                <button
                  type="button"
                  disabled={isRegisteringAll}
                  onClick={handleRegisterAll}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isRegisteringAll
                      ? 'Processing Registrations...'
                      : `Enroll in All ${optimizerResult.bestSchedule.sections.length} Courses Now`}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Visual Timetable Grid Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Interactive Timetable Grid Preview
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {timetableItems.length} schedule slot(s)
              </span>
            </div>

            <TimetableGrid items={timetableItems} compact={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
