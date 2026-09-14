import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { AcademicRecommendation } from '../types';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Compass,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export const Recommendations: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const [recommendations, setRecommendations] = useState<AcademicRecommendation[]>([]);
  const [studentSummary, setStudentSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      if (!user?.student?.id) return;
      try {
        setIsLoading(true);
        const res = await api.recommendations.getRecommendations(user.student.id);
        if (res.success) {
          setRecommendations(res.recommendations);
          setStudentSummary(res.studentSummary);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecs();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold mb-3 border border-white/15">
            <Compass className="w-3.5 h-3.5" />
            <span>Intelligent Academic Pathway Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Personalized Academic Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed">
            Recommendations calculated from your completed coursework, fulfilled prerequisites, and remaining degree milestones for your major.
          </p>
        </div>
      </div>

      {/* Student Academic Standing Summary Bar */}
      {studentSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Semester
            </span>
            <span className="text-lg font-black text-slate-900">
              Semester {studentSummary.semester}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed Credits
            </span>
            <span className="text-lg font-black text-slate-900">
              {studentSummary.completedCredits} cr
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Semester Limit
            </span>
            <span className="text-lg font-black text-slate-900">
              {studentSummary.registeredCredits} / {studentSummary.maxCredits} cr
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Cumulative GPA
            </span>
            <span className="text-lg font-black text-emerald-600">
              {studentSummary.currentGpa.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Recommendations Cards List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Computing personalized recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">No Pending Recommendations</h3>
          <p className="text-xs text-slate-500 mt-1">You have registered for all recommended courses for this term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Eligible Course Pathways ({recommendations.filter((r) => r.eligible).length} courses)
            </h2>
            <Link
              to="/planner"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Build in Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.courseId}
                className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${
                  rec.eligible
                    ? 'border-indigo-200/90'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {rec.courseCode}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {rec.credits} Credits
                      </span>
                      {rec.isCore && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          Core
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        rec.eligible
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rec.eligible ? '🟢 Eligible to Enroll' : '🔴 Missing Prereqs'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {rec.courseName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {rec.departmentName} • Target: Semester {rec.semester}
                  </p>

                  {/* Why recommended message */}
                  <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 leading-relaxed font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 inline mr-1 -mt-0.5" />
                    <span>{rec.reason}</span>
                  </div>

                  {/* Prerequisites breakdown */}
                  {rec.prerequisites && rec.prerequisites.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Prerequisites Status:
                      </span>
                      {rec.prerequisites.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs py-0.5 text-slate-600"
                        >
                          <span>
                            {p.prereqCode} ({p.prereqName})
                          </span>
                          <span
                            className={`font-semibold flex items-center gap-1 ${
                              p.satisfied ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {p.satisfied ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Completed ✓</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                <span>Missing</span>
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Priority Score: {rec.priorityScore}
                  </span>

                  <Link
                    to="/planner"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <span>Plan Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
