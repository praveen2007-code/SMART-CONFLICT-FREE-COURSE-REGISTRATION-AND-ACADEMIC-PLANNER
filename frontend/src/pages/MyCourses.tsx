import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { Registration } from '../types';
import { Modal } from '../components/Modal';
import {
  BookmarkCheck,
  Trash2,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Drop modal state
  const [courseToDrop, setCourseToDrop] = useState<Registration | null>(null);
  const [isDropping, setIsDropping] = useState(false);

  const fetchRegistrations = async () => {
    if (!user?.student?.id) return;
    try {
      setIsLoading(true);
      const res = await api.registrations.getStudentRegistrations(user.student.id);
      if (res.success) {
        setRegistrations(res.registrations);
        setTotalCredits(res.totalCredits);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load registered courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  const handleConfirmDrop = async () => {
    if (!courseToDrop) return;
    try {
      setIsDropping(true);
      const res = await api.registrations.drop(courseToDrop.enrollmentId);
      if (res.success) {
        success(res.message);
        setCourseToDrop(null);
        await fetchRegistrations();
      }
    } catch (err: any) {
      error(err.message || 'Failed to drop course');
    } finally {
      setIsDropping(false);
    }
  };

  const maxCredits = user?.student?.maxCredits || 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Registered Courses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active enrollments, credit summary, and course management
          </p>
        </div>

        {/* Credit Meter Widget */}
        <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 self-start sm:self-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Enrolled Credits
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900">{totalCredits}</span>
              <span className="text-xs text-slate-500">/ {maxCredits} max</span>
            </div>
          </div>
          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (totalCredits / maxCredits) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading your enrolled courses...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Active Registrations</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You are not enrolled in any courses for the Fall 2026 semester yet. Browse the catalog or use our Smart Planner.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Smart Course Planner</span>
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Course Catalog</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations.map((reg) => (
              <div
                key={reg.enrollmentId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {reg.courseCode}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        Section {reg.sectionCode}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {reg.credits} Credits
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {reg.courseName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{reg.departmentName}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{reg.facultyName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Room {reg.roomNumber}</span>
                    </div>
                    {reg.schedules && reg.schedules.length > 0 && (
                      <div className="flex items-center gap-2 text-indigo-700 font-mono">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          {reg.schedules
                            .map((s) => `${s.day_of_week} ${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}`)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Enrolled: {new Date(reg.enrolledAt).toLocaleDateString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCourseToDrop(reg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Drop Course</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Dropping a Course */}
      {courseToDrop && (
        <Modal
          isOpen={true}
          onClose={() => setCourseToDrop(null)}
          title="Confirm Course Drop"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">
                  Are you sure you want to drop {courseToDrop.courseCode}?
                </span>
                <p>
                  Dropping <strong>{courseToDrop.courseName} (Section {courseToDrop.sectionCode})</strong> will immediately release your reserved seat back into Redis for other students.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDrop(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Keep Course
              </button>
              <button
                type="button"
                disabled={isDropping}
                onClick={handleConfirmDrop}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {isDropping ? 'Dropping Course...' : 'Confirm & Drop Seat'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
