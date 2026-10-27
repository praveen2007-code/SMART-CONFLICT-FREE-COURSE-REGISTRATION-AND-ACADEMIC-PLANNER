import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { Registration } from '../types';
import { TimetableGrid, TimetableItem } from '../components/TimetableGrid';
import { CalendarDays, Clock, MapPin, User, BookmarkCheck, ArrowRight, BookOpen, Coffee, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Timetable: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.student?.id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await api.registrations.getStudentRegistrations(user.student.id);
        if (res.success) {
          setRegistrations(res.registrations);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load timetable');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, [user]);

  // Convert registrations into TimetableItems
  const timetableItems: TimetableItem[] = [];

  registrations.forEach((reg, cIdx) => {
    for (const sched of reg.schedules || []) {
      timetableItems.push({
        courseCode: reg.courseCode,
        courseName: reg.courseName,
        sectionCode: reg.sectionCode,
        room: `${reg.roomNumber || ''}`,
        dayOfWeek: sched.day_of_week,
        startTime: sched.start_time,
        endTime: sched.end_time,
        colorIndex: cIdx
      });
    }
  });

  const studentSeed = user?.student?.id || user?.id || user?.email || 'student_seed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Weekly Class Timetable
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fall 2026 Academic Schedule • Monday through Friday • 5 Hours Daily + Breaks + 1 Weekly Library Period
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
          >
            <span>Modify in Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading weekly timetable...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {registrations.length === 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">No course enrollments found yet</p>
                  <p className="text-slate-500 mt-0.5">
                    Your official weekly bell schedule and assigned <strong>Library Period</strong> are shown below. Enroll in courses using the Smart Planner!
                  </p>
                </div>
              </div>
              <Link
                to="/planner"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shrink-0 shadow-xs transition-colors"
              >
                <span>Launch Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Visual Weekly Grid */}
          <TimetableGrid
            items={timetableItems}
            studentSeed={studentSeed}
            showLibraryPeriod={true}
          />

          {/* Detailed Course & Activity List Underneath */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Weekly Academic Allocations & Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Permanent Library Period Card */}
              <div className="p-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/80 to-emerald-50/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-teal-600 text-white shadow-2xs">
                    📚 LIBRARY
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wider">
                    Weekly Allocation
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs leading-snug">
                  Library &amp; Digital Resource Period
                </h4>
                <div className="space-y-1 text-[11px] text-teal-900/90 pt-1 font-medium">
                  <p className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Central University Library (2nd Floor Digital Lab)</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Librarian Desk / Research Supervisor</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-teal-800">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>1 Hour Randomly Allocated Per Week (See Timetable Grid)</span>
                  </p>
                </div>
              </div>

              {/* Enrolled Courses */}
              {registrations.map((reg) => (
                <div
                  key={reg.enrollmentId}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {reg.courseCode}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 whitespace-nowrap">
                      {reg.sectionCode?.replace(/^SEC-/, 'Section ') || 'Section A'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{reg.courseName}</h4>
                  <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                    <p className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{reg.facultyName}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Room {reg.roomNumber}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-mono text-indigo-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {reg.schedules
                          .map((s) => `${s.day_of_week} ${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}`)
                          .join(', ')}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
