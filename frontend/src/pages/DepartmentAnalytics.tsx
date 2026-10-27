import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import {
  BarChart3,
  Users,
  BookOpen,
  Shuffle,
  CheckCircle2,
  Building2
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalCourses: number;
    totalEnrollments: number;
    totalCrossDeptEnrollments: number;
    activeCoursesWithRegistrations: number;
    departments: Array<{ id: number; code: string; name: string }>;
  };
  departmentAffinity: Record<string, Record<string, number>>;
  courses: any[];
}

export const DepartmentAnalytics: React.FC = () => {
  const { error } = useToast();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.admin.getDepartmentAnalytics();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load department analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getDeptColorClass = (code: string) => {
    switch (code) {
      case 'CS':
        return { badge: 'bg-indigo-100 text-indigo-800' };
      case 'DS':
        return { badge: 'bg-emerald-100 text-emerald-800' };
      case 'EE':
        return { badge: 'bg-amber-100 text-amber-800' };
      case 'MATH':
        return { badge: 'bg-purple-100 text-purple-800' };
      default:
        return { badge: 'bg-slate-100 text-slate-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-600">
          Loading departmental registration analytics...
        </p>
      </div>
    );
  }

  const depts = ['CS', 'DS', 'EE', 'MATH'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-900 font-mono text-[10px] font-bold">
              ANALYTICS DASHBOARD
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Department Registration Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of student registrations per course grouped by their home academic department
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors self-start sm:self-auto"
        >
          <BarChart3 className="w-3.5 h-3.5 text-brand-600" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total University Courses
              </span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {data.summary.totalCourses}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              64 courses per department
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active Enrollments
              </span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              {data.summary.totalEnrollments}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Across active sections
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cross-Dept Registrations
              </span>
              <Shuffle className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-2xl font-black text-purple-600 mt-1 block">
              {data.summary.totalCrossDeptEnrollments}
            </span>
            <span className="text-[11px] text-purple-700 font-medium mt-0.5 block">
              Interdisciplinary enrollment
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Courses With Students
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {data.summary.activeCoursesWithRegistrations}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Active student cohorts
            </span>
          </div>
        </div>
      )}

      {/* Interdepartmental Registration Flow Matrix */}
      {data && data.departmentAffinity && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                <span>Department Enrollment Affinity Matrix</span>
              </h3>
              <p className="text-xs text-slate-500">
                Shows where students from each home department are choosing their courses
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Row: Student Home Dept | Column: Course Offering Dept
            </span>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2.5 px-3 text-left font-bold text-slate-500 uppercase text-[10px]">
                    Student's Department
                  </th>
                  {depts.map((d) => (
                    <th key={d} className="py-2.5 px-3 font-bold text-slate-800">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono">
                        {d} Courses
                      </span>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 font-bold text-slate-800">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depts.map((stuDept) => {
                  const row = data.departmentAffinity[stuDept] || { CS: 0, DS: 0, EE: 0, MATH: 0 };
                  const rowTotal = (row.CS || 0) + (row.DS || 0) + (row.EE || 0) + (row.MATH || 0);
                  const colors = getDeptColorClass(stuDept);

                  return (
                    <tr key={stuDept} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-left font-bold text-slate-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-xs font-semibold ${colors.badge}`}>
                          {stuDept} Students
                        </span>
                      </td>
                      {depts.map((crsDept) => {
                        const count = row[crsDept] || 0;
                        const isSelfDept = stuDept === crsDept;

                        return (
                          <td key={crsDept} className="py-3 px-3">
                            <span
                              className={`inline-block min-w-[28px] py-1 px-2 rounded-lg font-mono font-bold text-xs ${
                                count > 0
                                  ? isSelfDept
                                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                    : 'bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs'
                                  : 'text-slate-300'
                              }`}
                            >
                              {count}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
