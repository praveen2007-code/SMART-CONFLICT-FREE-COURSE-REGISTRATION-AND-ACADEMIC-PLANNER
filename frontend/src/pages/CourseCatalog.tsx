import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { Course, CourseSection } from '../types';
import { CourseCard } from '../components/CourseCard';
import { Modal } from '../components/Modal';
import { SeatBadge } from '../components/SeatBadge';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  MapPin,
  BookmarkCheck,
  RefreshCw
} from 'lucide-react';

export const CourseCatalog: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [semester, setSemester] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await api.courses.getAll({
        search,
        department,
        semester,
        studentId: user?.student?.id
      });
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch course catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [department, semester, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleRegisterSection = async (sectionId: number) => {
    if (!user) {
      error('Please sign in to register for courses.');
      return;
    }
    try {
      setIsRegistering(true);
      const res = await api.registrations.register(sectionId, user.student?.id);
      if (res.success) {
        success(res.message);
        setSelectedCourse(null);
        await fetchCourses(); // Refresh catalog & seat counts
      }
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            University Course Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore 20+ accredited courses, view live seat counts, prerequisites, and schedules
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCourses}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Seats</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course code, title, or keywords (e.g. CS301, Machine Learning)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-52">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none bg-white"
            >
              <option value="ALL">All Departments</option>
              <option value="CS">Computer Science</option>
              <option value="DS">Data Science & AI</option>
              <option value="EE">Electrical Engineering</option>
              <option value="MATH">Mathematics</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div className="w-full sm:w-40">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none bg-white"
            >
              <option value="ALL">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading courses from catalog...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Filter className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">No Courses Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onViewDetails={(c) => setSelectedCourse(c)}
              onQuickRegister={handleRegisterSection}
              isRegistering={isRegistering}
            />
          ))}
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCourse(null)}
          title={`${selectedCourse.code} — ${selectedCourse.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                {selectedCourse.code}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {selectedCourse.credits} Credits
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Semester {selectedCourse.semester}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {selectedCourse.departmentName}
              </span>
              {selectedCourse.isCore && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  Core Requirement
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Course Description
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedCourse.description}
              </p>
            </div>

            {/* Prerequisites */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Prerequisites Check
              </h4>
              {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedCourse.prerequisites.map((p) => (
                    <div
                      key={p.prerequisiteCourseId}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                        p.satisfied
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}
                    >
                      <span className="font-semibold">
                        {p.code} — {p.name}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[11px]">
                        {p.satisfied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed ✓</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Not Completed ✗</span>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  No prerequisites required for this course.
                </p>
              )}
            </div>

            {/* Course Sections & Real-Time Availability */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Available Sections & Real-Time Seats (Redis)
              </h4>
              <div className="space-y-3">
                {selectedCourse.sections && selectedCourse.sections.length > 0 ? (
                  selectedCourse.sections.map((section) => (
                    <div
                      key={section.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            Section {section.sectionCode}
                          </span>
                          <SeatBadge
                            status={section.seatStatus}
                            available={section.availableSeats}
                            capacity={section.maxCapacity}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {section.facultyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {section.roomNumber}
                          </span>
                        </div>
                        {section.schedules && section.schedules.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-mono pt-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>
                              {section.schedules
                                .map((s) => `${s.day_of_week} ${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}`)
                                .join(' | ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Register Action */}
                      <div>
                        {selectedCourse.isRegistered ? (
                          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>Registered</span>
                          </span>
                        ) : selectedCourse.isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              !selectedCourse.satisfiesPrerequisites ||
                              section.availableSeats === 0 ||
                              isRegistering
                            }
                            onClick={() => handleRegisterSection(section.id)}
                            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all ${
                              !selectedCourse.satisfiesPrerequisites || section.availableSeats === 0
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-brand-600 hover:bg-brand-700 text-white'
                            }`}
                          >
                            {section.availableSeats === 0 ? 'Full' : 'Enroll in Section'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No sections currently scheduled.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
