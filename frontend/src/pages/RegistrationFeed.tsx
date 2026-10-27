import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import {
  Activity,
  RefreshCw,
  Search,
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  Layers,
  Filter,
  ChevronDown,
  Download
} from 'lucide-react';

interface Registration {
  id: number;
  student_name: string;
  student_code: string;
  course_code: string;
  course_name: string;
  section_code: string;
  credits: number;
  enrolled_at: string;
  department?: string;
  semester?: number;
}

const formatSectionDisplay = (code?: string): string => {
  if (!code) return 'Section A';
  const clean = code.replace(/^(SEC-|Sec\s*|Section\s*)/i, '').trim();
  return clean ? `Section ${clean}` : code;
};

const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CS:   { bg: 'bg-indigo-50',   text: 'text-indigo-700',  border: 'border-indigo-200' },
  DS:   { bg: 'bg-purple-50',   text: 'text-purple-700',  border: 'border-purple-200' },
  EE:   { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200' },
  MATH: { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200' }
};

function getDeptFromCode(courseCode: string): string {
  if (courseCode.startsWith('CS'))   return 'CS';
  if (courseCode.startsWith('DS') || courseCode.startsWith('AI')) return 'DS';
  if (courseCode.startsWith('EE'))   return 'EE';
  if (courseCode.startsWith('MA') || courseCode.startsWith('MT')) return 'MATH';
  return 'CS';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const RegistrationFeed: React.FC = () => {
  const { error } = useToast();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [creditFilter, setCreditFilter] = useState('ALL');

  const fetchFeed = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);
      const res = await api.admin.getRegistrations();
      if (res.success) {
        setRegistrations(res.registrations ?? []);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch registrations');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [error]);

  useEffect(() => {
    fetchFeed(false);
  }, [fetchFeed]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchFeed(true), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchFeed]);

  const filtered = registrations.filter((reg) => {
    const dept = getDeptFromCode(reg.course_code);
    const matchSearch =
      !search ||
      reg.student_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.student_code.toLowerCase().includes(search.toLowerCase()) ||
      reg.course_code.toLowerCase().includes(search.toLowerCase()) ||
      reg.course_name.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || dept === deptFilter;
    const matchCredit = creditFilter === 'ALL' || reg.credits.toString() === creditFilter;
    return matchSearch && matchDept && matchCredit;
  });

  // Summary cards
  const uniqueStudents = new Set(registrations.map((r) => r.student_code)).size;
  const uniqueCourses  = new Set(registrations.map((r) => r.course_code)).size;

  // Department distribution
  const deptCounts = registrations.reduce<Record<string, number>>((acc, r) => {
    const d = getDeptFromCode(r.course_code);
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});

  // Download CSV
  const downloadCSV = () => {
    const headers = ['Student Name', 'Student Code', 'Course Code', 'Course Name', 'Section', 'Credits', 'Enrolled At'];
    const rows = filtered.map((r) => [
      r.student_name,
      r.student_code,
      r.course_code,
      r.course_name,
      formatSectionDisplay(r.section_code),
      r.credits,
      new Date(r.enrolled_at).toLocaleString()
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              ADMIN ONLY
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-400/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Registration Feed
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Live stream of all student course enrollments across the university
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Auto-refresh toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors border ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}
            />
            {autoRefresh ? 'Live' : 'Auto-refresh'}
          </button>

          <button
            type="button"
            onClick={() => fetchFeed(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={downloadCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            label: 'Total Registrations',
            value: registrations.length,
            icon: Activity,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-100'
          },
          {
            label: 'Unique Students',
            value: uniqueStudents,
            icon: GraduationCap,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100'
          },
          {
            label: 'Courses Enrolled',
            value: uniqueCourses,
            icon: BookOpen,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100'
          },

        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} border ${border}`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className={`text-xl font-black ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Department Distribution */}
      {registrations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">Enrollment by Department</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['CS', 'DS', 'EE', 'MATH'] as const).map((dept) => {
              const count = deptCounts[dept] ?? 0;
              const pct = registrations.length > 0 ? Math.round((count / registrations.length) * 100) : 0;
              const c = DEPT_COLORS[dept];
              return (
                <div key={dept} className={`rounded-xl border ${c.border} ${c.bg} p-3`}>
                  <span className={`text-xs font-black ${c.text} block`}>{dept}</span>
                  <span className="text-xl font-black text-slate-900 block mt-0.5">{count}</span>
                  <div className="mt-2 h-1.5 rounded-full bg-white/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.text.replace('text', 'bg')}`}
                      style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 mt-1 block">{pct}% of total</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student, course code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Dept filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="pl-8 pr-7 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none bg-white appearance-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="ALL">All Departments</option>
              <option value="CS">CS</option>
              <option value="DS">DS</option>
              <option value="EE">EE</option>
              <option value="MATH">MATH</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Credits filter */}
          <div className="relative">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <select
              value={creditFilter}
              onChange={(e) => setCreditFilter(e.target.value)}
              className="pl-8 pr-7 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none bg-white appearance-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="ALL">All Credits</option>
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <option key={c} value={c}>{c} Credits</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="ml-auto text-[11px] text-slate-400 font-medium whitespace-nowrap hidden sm:block">
            <Clock className="inline w-3 h-3 mr-1" />
            Updated {timeAgo(lastUpdated.toISOString())}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading registrations...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Activity className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">No registrations found</p>
            <p className="text-xs text-slate-400 mt-1">
              {registrations.length === 0
                ? 'No students have enrolled in courses yet.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4 whitespace-nowrap">Section</th>
                  <th className="py-3 px-4">Dept</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">When</th>
                  <th className="py-3 px-4">Full Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((reg, idx) => {
                  const dept = getDeptFromCode(reg.course_code);
                  const dc = DEPT_COLORS[dept] ?? DEPT_COLORS['CS'];
                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black text-slate-600">
                              {reg.student_name?.charAt(0) ?? '?'}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-none">
                              {reg.student_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              {reg.student_code}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-indigo-700">{reg.course_code}</span>
                        <span className="text-slate-600 block text-[11px] max-w-[200px] truncate">
                          {reg.course_name}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {formatSectionDisplay(reg.section_code)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border ${dc.bg} ${dc.text} ${dc.border}`}
                        >
                          {dept}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-700">
                        {reg.credits} cr
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {timeAgo(reg.enrolled_at)}
                      </td>

                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(reg.enrolled_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Showing <strong className="text-slate-600">{filtered.length}</strong> of{' '}
                <strong className="text-slate-600">{registrations.length}</strong> registrations
              </span>
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
