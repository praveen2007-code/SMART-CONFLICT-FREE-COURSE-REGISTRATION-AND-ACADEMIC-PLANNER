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
  RotateCcw,
  BookOpen,
  Filter,
  Check,
  Search,
  BookmarkCheck,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const CoursePlanner: React.FC = () => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);

  // Timetable view width state
  const [isTimetableExpanded, setIsTimetableExpanded] = useState(false);

  // Filtering & View Modes
  const studentDept = user?.student?.departmentCode || 'DS';
  const studentSem = user?.student?.semester?.toString() || '1';
  const [viewMode, setViewMode] = useState<'REGISTERED' | 'SEMESTER' | 'ALL'>('REGISTERED');
  const [filterDept, setFilterDept] = useState<string>(studentDept);
  const [filterSem, setFilterSem] = useState<string>(studentSem);
  const [searchQuery, setSearchQuery] = useState('');

  // Conflict state
  const [conflictReport, setConflictReport] = useState<ConflictCheckResponse | null>(null);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  // Optimizer state
  const [optimizerResult, setOptimizerResult] = useState<GeneratedScheduleResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [preferredTime, setPreferredTime] = useState<'ANY' | 'MORNING' | 'AFTERNOON'>('ANY');

  const [isRegisteringAll, setIsRegisteringAll] = useState(false);

  // 1. Fetch courses and auto-detect registered courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const res = await api.courses.getAll({ studentId: user?.student?.id });
        if (res.success) {
          setCourses(res.courses);

          // Find registered courses for student
          const registered = res.courses.filter((c: Course) => c.isRegistered);

          if (registered.length > 0) {
            // Auto-select registered courses into planner
            const regCIds = registered.map((c: Course) => c.id);
            const regSIds: number[] = [];
            registered.forEach((c: Course) => {
              if (c.sections && c.sections.length > 0) {
                regSIds.push(c.sections[0].id);
              }
            });
            setSelectedCourseIds(regCIds);
            setSelectedSectionIds(regSIds);
            setViewMode('REGISTERED');
          } else {
            // No registered courses yet: show student's curriculum (Semester 1)
            setViewMode('SEMESTER');
          }
        }
      } catch (err: any) {
        error(err.message || 'Failed to load course list');
      } finally {
        setIsLoadingCourses(false);
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

  // Select all displayed courses in the current tab
  const handleSelectAllDisplayed = () => {
    const cIds = displayedCourses.map((c) => c.id);
    const sIds = displayedCourses
      .map((c) => (c.sections && c.sections.length > 0 ? c.sections[0].id : null))
      .filter((id): id is number => id !== null);

    setSelectedCourseIds(cIds);
    setSelectedSectionIds(sIds);
    success(`Selected all ${cIds.length} course(s) on view.`);
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
        // Refresh courses to update registration statuses
        const res = await api.courses.getAll({ studentId: user?.student?.id });
        if (res.success) {
          setCourses(res.courses);
        }
      }
    } finally {
      setIsRegisteringAll(false);
    }
  };

  // Filter courses based on user preference and tabs
  const registeredCourses = courses.filter((c) => c.isRegistered);
  const semesterCourses = courses.filter(
    (c) => c.departmentCode === filterDept && c.semester === Number(filterSem)
  );

  let displayedCourses: Course[] = [];
  if (viewMode === 'REGISTERED') {
    displayedCourses = registeredCourses;
  } else if (viewMode === 'SEMESTER') {
    displayedCourses = semesterCourses;
  } else {
    displayedCourses = courses.filter((c) => {
      const matchDept = filterDept === 'ALL' || c.departmentCode === filterDept;
      const matchSem = filterSem === 'ALL' || c.semester === Number(filterSem);
      return matchDept && matchSem;
    });
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedCourses = displayedCourses.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }

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
            <span>Academic Schedule &amp; Registration Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Smart Course Planner
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-2 leading-relaxed">
            View your enrolled courses or select from your cohort's curriculum. Timetable conflicts, bell schedules, and seat limits are calculated in real time.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                setViewMode('SEMESTER');
                setFilterDept(studentDept);
                setFilterSem(studentSem);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-950" />
              <span>View {studentDept} Sem {studentSem} Courses ({semesterCourses.length})</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Selection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Course Selector (Left) vs Real-Time Timetable & Conflict Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Course & Section Selection */}
        <div className={`${isTimetableExpanded ? 'hidden' : 'lg:col-span-4'} space-y-4`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            {/* Header with Title and Credits */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Course Selection</h3>
                <p className="text-xs text-slate-500">
                  {selectedCourseIds.length} course(s) selected • {currentTotalCredits} credits
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700">
                Max: {user?.student?.maxCredits || 20} cr
              </span>
            </div>

            {/* View Mode Tabs (Registered vs Semester vs All) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('REGISTERED')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'REGISTERED'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>My Registered ({registeredCourses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('SEMESTER')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'SEMESTER'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>{filterDept} Sem {filterSem}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('ALL')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  viewMode === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Browse</span>
              </button>
            </div>

            {/* Filter Bar if viewing Semester or All */}
            {viewMode !== 'REGISTERED' && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Department
                    </label>
                    <select
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                    >
                      <option value="DS">Data Science (DS)</option>
                      <option value="CS">Computer Science (CS)</option>
                      <option value="EE">Electrical Eng (EE)</option>
                      <option value="MATH">Mathematics (MATH)</option>
                      {viewMode === 'ALL' && <option value="ALL">All Departments</option>}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Semester
                    </label>
                    <select
                      value={filterSem}
                      onChange={(e) => setFilterSem(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s.toString()}>
                          Semester {s}
                        </option>
                      ))}
                      {viewMode === 'ALL' && <option value="ALL">All Semesters</option>}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Showing {displayedCourses.length} course(s)
                  </span>
                  {displayedCourses.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllDisplayed}
                      className="text-brand-600 hover:text-brand-700 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Select All on View</span>
                    </button>
                  )}
                </div>
              </div>
            )}

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

            {/* Action Buttons: Generate Best Schedule & Register All */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={selectedCourseIds.length === 0 || isOptimizing}
                onClick={handleGenerateBestSchedule}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isOptimizing ? 'Analyzing Timetable Slots...' : 'Generate Best Schedule'}</span>
              </button>

              {selectedSectionIds.length > 0 && !conflictReport?.hasConflicts && (
                <button
                  type="button"
                  disabled={isRegisteringAll}
                  onClick={handleRegisterAll}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isRegisteringAll
                      ? 'Registering...'
                      : `Register for Selected Courses (${selectedSectionIds.length})`}
                  </span>
                </button>
              )}
            </div>

            {/* Course Checklist */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {isLoadingCourses ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Loading course catalog...</p>
                </div>
              ) : displayedCourses.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="font-bold text-slate-800 text-xs">
                    {viewMode === 'REGISTERED'
                      ? 'No registered courses found yet'
                      : 'No courses match the selected filter'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {viewMode === 'REGISTERED'
                      ? 'Switch to the Semester tab to select and enroll in your semester courses.'
                      : 'Try adjusting your department or semester filter.'}
                  </p>
                  {viewMode === 'REGISTERED' && (
                    <button
                      type="button"
                      onClick={() => setViewMode('SEMESTER')}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white font-bold text-xs shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Browse {filterDept} Sem {filterSem} Courses</span>
                    </button>
                  )}
                </div>
              ) : (
                displayedCourses.map((course) => {
                  const isSelected = selectedCourseIds.includes(course.id);
                  const activeSectionId = selectedSectionIds.find((sId) =>
                    course.sections.some((s) => s.id === sId)
                  );

                  return (
                    <div
                      key={course.id}
                      className={`rounded-2xl border p-3.5 transition-all ${
                        course.isRegistered
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : isSelected
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
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {course.code}
                              </span>
                              {course.isRegistered && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                  <BookmarkCheck className="w-3 h-3" />
                                  <span>Registered</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {course.credits} cr
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">
                            {course.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {course.departmentName} • Sem {course.semester}
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
                                    <span className="font-bold whitespace-nowrap">
                                      {sec.sectionCode?.replace(/^SEC-/, 'Section ') || 'Section A'}
                                    </span>
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
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Conflict Engine & Timetable Preview */}
        <div className={`${isTimetableExpanded ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>
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
              {optimizerResult.recommendations && optimizerResult.recommendations.length > 0 && (
                <div className="bg-indigo-50/60 rounded-xl p-3.5 space-y-1 text-xs text-indigo-950 font-medium">
                  <p className="font-bold text-indigo-900 mb-1">Schedule Recommendations:</p>
                  {optimizerResult.recommendations.map((rec, rIdx) => (
                    <p key={rIdx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{rec}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Visual Timetable Grid Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Interactive Timetable Grid Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  {timetableItems.length} schedule slot(s)
                </span>
                <button
                  type="button"
                  onClick={() => setIsTimetableExpanded(!isTimetableExpanded)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all hover:border-slate-300"
                  title={isTimetableExpanded ? 'Switch to side-by-side split view' : 'Expand timetable to full width'}
                >
                  {isTimetableExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Split View (Show Selector)</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Full-Width View</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <TimetableGrid
              items={timetableItems}
              compact={false}
              studentSeed={user?.student?.id || user?.id || user?.email}
              showLibraryPeriod={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
