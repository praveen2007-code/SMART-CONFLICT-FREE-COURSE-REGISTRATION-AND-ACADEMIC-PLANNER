import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { Registration, AcademicRecommendation } from '../types';
import { Link, Navigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Calendar,
  AlertTriangle,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToast();

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [recommendations, setRecommendations] = useState<AcademicRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.student?.id) return;
      try {
        setIsLoading(true);
        const [regRes, recRes] = await Promise.all([
          api.registrations.getStudentRegistrations(user.student.id),
          api.recommendations.getRecommendations(user.student.id)
        ]);

        if (regRes.success) {
          setRegistrations(regRes.registrations);
          setTotalCredits(regRes.totalCredits);
        }

        if (recRes.success) {
          setRecommendations(recRes.recommendations.slice(0, 3));
        }
      } catch (err: any) {
        error(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const maxCredits = user?.student?.maxCredits || 20;
  const creditPercentage = Math.min(100, Math.round((totalCredits / maxCredits) * 100));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-indigo-700 to-purple-800 p-8 text-white shadow-xl shadow-indigo-900/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Semester Fall 2026 • Registration Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
            Manage your schedule, check real-time seat availability, and use our{' '}
            <strong className="text-white underline decoration-amber-400 decoration-2">
              Smart Conflict-Free Planner
            </strong>{' '}
            to build your dream timetable without overlap mistakes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Launch Smart Planner</span>
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
        {/* Background glow circle */}
        <div className="absolute right-0 -bottom-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Credits */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Credits</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCredits}</span>
            <span className="text-xs text-slate-500">/ {maxCredits} max credits</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                creditPercentage > 90 ? 'bg-amber-500' : 'bg-brand-600'
              }`}
              style={{ width: `${creditPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Enrolled Courses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Active Courses</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{registrations.length}</span>
            <span className="text-xs text-slate-500">enrolled sections</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Seats confirmed in Redis</span>
          </p>
        </div>

        {/* Metric 3: Academic Standing */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Academic Standing</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">Good Standing</span>
          </div>
          <p className="text-[11px] text-purple-700 font-medium mt-3">
            Semester {user?.student?.semester || 1} • Regular Status
          </p>
        </div>

        {/* Metric 4: Academic Recommendations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Recommended</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{recommendations.length}</span>
            <span className="text-xs text-slate-500">eligible courses</span>
          </div>
          <Link
            to="/recommendations"
            className="text-[11px] text-brand-600 hover:text-brand-700 font-bold mt-3 inline-flex items-center gap-1"
          >
            <span>View suggestions</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Enrolled Courses</h2>
              <p className="text-xs text-slate-500">Your current registrations for Fall 2026</p>
            </div>
            <Link
              to="/my-courses"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {registrations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Courses Registered Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                You haven't enrolled in any courses for this semester yet. Use our Smart Course Planner to create an optimal schedule.
              </p>
              <Link
                to="/planner"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Go to Smart Planner</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((reg) => (
                <div
                  key={reg.enrollmentId}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {reg.courseCode}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Sec {reg.sectionCode}
                      </span>
                      <span className="text-xs text-slate-400">• {reg.credits} Credits</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{reg.courseName}</h4>
                    <p className="text-xs text-slate-500">
                      Instructor: {reg.facultyName} • Room: {reg.roomNumber}
                    </p>
                    {reg.schedules && reg.schedules.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-mono mt-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          {reg.schedules
                            .map((s) => `${s.day_of_week} ${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}`)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/timetable"
                    className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-colors shrink-0"
                    title="View on Timetable"
                  >
                    <Calendar className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recommendations & Planner Callout */}
        <div className="space-y-6">
          {/* Smart Planner Promo Box */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-purple-50/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Conflict-Free Course Planner</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tired of manual timetable clashes? Select your courses and let our optimization algorithm find the best combination with 0 schedule conflicts.
            </p>
            <Link
              to="/planner"
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Try Smart Course Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Academic Recommendations Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Recommended For You</h3>
              <Link
                to="/recommendations"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.courseId}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {rec.courseCode}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Eligible ✓
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{rec.courseName}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
