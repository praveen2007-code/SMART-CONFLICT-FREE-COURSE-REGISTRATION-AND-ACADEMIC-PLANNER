import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  GraduationCap,
  Shield,
  ShieldCheck,
  Layers,
  Users,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const loadProfileData = async () => {
      if (isAdmin) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await api.courses.getAll({ studentId: user?.student?.id });
        if (res.success) {
          const completed = res.courses.filter((c: any) => c.isCompleted);
          setCompletedCourses(completed);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfileData();
  }, [user, isAdmin]);

  // ==========================================
  // STAFF / ADMIN PROFILE VIEW
  // ==========================================
  if (isAdmin) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff & Faculty Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administrative credentials, department oversight, and academic governance
          </p>
        </div>

        {/* Main Staff Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Shield className="w-10 h-10" />
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>College Faculty / Admin</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span>
                Staff Designation: <strong className="text-slate-900">Academic Coordinator & Administrator</strong>
              </span>
              <span>•</span>
              <span>
                Department: <strong className="text-slate-900">Academic Affairs & Course Scheduling</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Administrative Clearance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider">Administrative Role</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-2xl font-black text-slate-900">College Staff</span>
            <p className="text-[11px] text-purple-700 font-semibold mt-1">Full Course Control</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider">Departmental Scope</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-black text-slate-900">All Departments</span>
            <p className="text-[11px] text-slate-500 mt-1">CS, DS, EE, Mathematics</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider">Access Clearance</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-slate-900">Level 1 (Full)</span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Authorized Official</p>
          </div>
        </div>

        {/* Staff Privileges & Fast Access */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Staff Responsibilities & Privileges</h3>
              <p className="text-xs text-slate-500">Your authorized capabilities within the academic platform</p>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Admin Control Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Curriculum & Course Creation</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Publish new courses, assign credit weights, and define prerequisite rules.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Section & Timetable Scheduling</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Assign professors, configure time slots, and allocate lecture halls or labs.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Real-Time Seat Adjustments</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Dynamically increase or restrict seat limits during peak enrollment periods.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Campus-Wide Enrollment Audits</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Monitor high-demand courses, under-enrolled sections, and live registration logs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STUDENT PROFILE VIEW
  // ==========================================
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Academic identity, enrollment status, and degree transcript
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-brand-500/25 shrink-0">
          {user?.name?.charAt(0) || 'S'}
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Active Student
            </span>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600">
            <span>
              Student ID: <strong className="text-slate-900 font-mono">{user?.student?.studentCode || 'STU-2024-001'}</strong>
            </span>
            <span>•</span>
            <span>
              Major: <strong className="text-slate-900">{user?.student?.departmentName || 'Computer Science'}</strong>
            </span>
            <span>•</span>
            <span>
              Semester: <strong className="text-slate-900">{user?.student?.semester || 4}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Academic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Academic Standing</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">
            Good Standing
          </span>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Regular Student</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Semester Credit Cap</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">
            {user?.student?.maxCredits || 20} Credits
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Standard Full-Time Load</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Completed Courses</span>
            <GraduationCap className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">
            {completedCourses.length} Courses
          </span>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">Prerequisites Unlocked</p>
        </div>
      </div>

      {/* Completed Transcript */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Academic Transcript (Completed Courses)</h3>
          <span className="text-xs text-slate-500 font-medium">
            Satisfies degree prerequisites
          </span>
        </div>

        {completedCourses.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No completed course records found for this profile.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {completedCourses.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700">{c.code}</span>
                    <span className="text-xs text-slate-500">• {c.credits} Credits</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{c.name}</h4>
                  <p className="text-[11px] text-slate-500">{c.departmentName}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                  Grade A
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
