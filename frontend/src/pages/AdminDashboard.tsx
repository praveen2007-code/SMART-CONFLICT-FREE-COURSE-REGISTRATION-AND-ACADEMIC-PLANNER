import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { AdminStats, Course } from '../types';
import { Modal } from '../components/Modal';
import { SeatBadge } from '../components/SeatBadge';
import {
  Shield,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  TrendingDown,
  TrendingUp,
  Clock,
  Layers,
  Search,
  BarChart3,
  Activity
} from 'lucide-react';

const formatSectionDisplay = (code?: string): string => {
  if (!code) return 'Section A';
  const clean = code.replace(/^(SEC-|Sec\s*|Section\s*)/i, '').trim();
  return clean ? `Section ${clean}` : code;
};

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [fullCourses, setFullCourses] = useState<any[]>([]);
  const [lowEnrollment, setLowEnrollment] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<'students' | 'enrollments'>('students');
  const [hoveredSem, setHoveredSem] = useState<number | null>(null);

  // Modals
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<any>(null);
  const [isClearStudentsOpen, setIsClearStudentsOpen] = useState(false);
  const [isClearingStudents, setIsClearingStudents] = useState(false);

  // New course form state
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(3);
  const [newCourseDept, setNewCourseDept] = useState(1);
  const [newCourseSemester, setNewCourseSemester] = useState(4);
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // New section form state
  const [sectionCourseId, setSectionCourseId] = useState<number>(1);
  const [sectionCode, setSectionCode] = useState('SEC-C');
  const [facultyName, setFacultyName] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(30);
  const [roomNumber, setRoomNumber] = useState('Hall-101');
  const [scheduleDay, setScheduleDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'>('MON');
  const [scheduleStart, setScheduleStart] = useState('09:00');
  const [scheduleEnd, setScheduleEnd] = useState('10:30');

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, coursesRes] = await Promise.all([
        api.admin.getStats(),
        api.courses.getAll()
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        setSections(statsRes.sections);
        setFullCourses(statsRes.fullCourses);
        setLowEnrollment(statsRes.lowEnrollmentCourses);
      }

      if (coursesRes.success) {
        setCourses(coursesRes.courses);
        if (coursesRes.courses.length > 0) {
          setSectionCourseId(coursesRes.courses[0].id);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.admin.createCourse({
        code: newCourseCode,
        name: newCourseName,
        credits: newCourseCredits,
        departmentId: newCourseDept,
        semester: newCourseSemester,
        description: newCourseDesc,
        isCore: true
      });
      if (res.success) {
        success('Course added successfully!');
        setIsAddCourseOpen(false);
        setNewCourseCode('');
        setNewCourseName('');
        await fetchAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to create course');
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.admin.createSection({
        courseId: sectionCourseId,
        sectionCode,
        facultyName,
        maxCapacity,
        roomNumber,
        semesterTerm: 'Fall 2026',
        schedules: [
          {
            dayOfWeek: scheduleDay,
            startTime: scheduleStart,
            endTime: scheduleEnd,
            building: 'Main Hall',
            room: roomNumber
          }
        ]
      });
      if (res.success) {
        success('Section & schedule created successfully!');
        setIsAddSectionOpen(false);
        setFacultyName('');
        await fetchAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to create section');
    }
  };

  const handleUpdateSectionCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionToEdit) return;
    try {
      const res = await api.admin.updateSection(sectionToEdit.sectionId, {
        maxCapacity: sectionToEdit.capacity,
        facultyName: sectionToEdit.facultyName
      });
      if (res.success) {
        success('Section capacity updated & synchronized in Redis!');
        setIsEditSectionOpen(false);
        setSectionToEdit(null);
        await fetchAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update section');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course and its sections?')) return;
    try {
      const res = await api.admin.deleteCourse(courseId);
      if (res.success) {
        success(res.message);
        await fetchAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete course');
    }
  };

  const handleClearStudents = async () => {
    try {
      setIsClearingStudents(true);
      const res = await api.admin.clearStudentData();
      if (res.success) {
        success(`Student data cleared — ${res.deleted.students} students, ${res.deleted.enrollments} enrollments removed.`);
        setIsClearStudentsOpen(false);
        await fetchAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to clear student data');
    } finally {
      setIsClearingStudents(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
              ADMIN ONLY
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Administrative Control Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage courses, sections, seat limits, and track university-wide registrations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors border border-purple-200/60"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dept Analytics</span>
          </Link>
          <Link
            to="/registration-feed"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors border border-rose-200/60"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Registration Feed</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsAddCourseOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddSectionOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Create Section</span>
          </button>
          <button
            type="button"
            onClick={() => setIsClearStudentsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Students</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Students
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.totalStudents}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Courses
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.totalCourses}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Enrollments
            </span>
            <span className="text-2xl font-black text-indigo-600">
              {stats.activeRegistrations}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Full Sections
            </span>
            <span className="text-2xl font-black text-rose-600">{stats.fullCoursesCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Low Enrollment
            </span>
            <span className="text-2xl font-black text-amber-600">{stats.lowEnrollmentCount}</span>
          </div>
        </div>
      )}

      {/* Graphical Representation: Semester-wise Registrations Chart */}
      {stats && stats.semesterRegistrations && stats.semesterRegistrations.length > 0 && (() => {
        const semesterStats = stats.semesterRegistrations;
        const maxMetricValue = Math.max(
          ...semesterStats.map((s) => (chartMetric === 'students' ? s.registeredStudents : s.totalEnrollments)),
          4
        );
        const peakSem = [...semesterStats].sort((a, b) => b.registeredStudents - a.registeredStudents)[0];

        return (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-100 shadow-2xs">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">
                      Student Registrations by Academic Semester
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Live Analytics
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visual graphical distribution of registered students and course enrollments across Semester 1 to Semester 8
                  </p>
                </div>
              </div>

              {/* Metric Mode Toggle */}
              <div className="flex items-center bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setChartMetric('students')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMetric === 'students'
                      ? 'bg-white text-brand-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Registered Students
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('enrollments')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMetric === 'enrollments'
                      ? 'bg-white text-brand-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Total Course Enrollments
                </button>
              </div>
            </div>

            {/* Graphical Chart Canvas */}
            <div className="p-6">
              <div className="relative pt-6 pb-2">
                {/* Horizontal Guide Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40 pb-12">
                  <div className="border-b border-dashed border-slate-200 w-full" />
                  <div className="border-b border-dashed border-slate-200 w-full" />
                  <div className="border-b border-dashed border-slate-200 w-full" />
                  <div className="border-b border-slate-200 w-full" />
                </div>

                {/* 8 Semester Columns */}
                <div className="relative grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-4 items-end h-56 z-10">
                  {semesterStats.map((item) => {
                    const val = chartMetric === 'students' ? item.registeredStudents : item.totalEnrollments;
                    const barHeightPct = maxMetricValue > 0 ? Math.round((val / maxMetricValue) * 100) : 0;
                    const isHovered = hoveredSem === item.semester;

                    return (
                      <div
                        key={item.semester}
                        className="flex flex-col items-center h-full justify-end group cursor-pointer"
                        onMouseEnter={() => setHoveredSem(item.semester)}
                        onMouseLeave={() => setHoveredSem(null)}
                      >
                        {/* Dynamic Value Badge */}
                        <div
                          className={`mb-2 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-all duration-200 ${
                            val > 0
                              ? 'bg-indigo-600 text-white shadow-2xs scale-100'
                              : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                          } ${isHovered ? 'scale-110 ring-2 ring-indigo-300' : ''}`}
                        >
                          {val} {val === 1 ? (chartMetric === 'students' ? 'stu' : 'enr') : (chartMetric === 'students' ? 'students' : 'enrolled')}
                        </div>

                        {/* Bar Pillar */}
                        <div className="w-full max-w-[48px] bg-slate-100/80 rounded-t-xl overflow-hidden flex flex-col justify-end h-36 border border-slate-200/60 relative shadow-inner">
                          <div
                            style={{ height: `${Math.max(val > 0 ? 15 : 0, barHeightPct)}%` }}
                            className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                              val > 0
                                ? isHovered
                                  ? 'bg-gradient-to-t from-indigo-700 to-brand-500 shadow-md'
                                  : 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                                : 'bg-transparent'
                            }`}
                          />
                        </div>

                        {/* Semester Label */}
                        <div className="mt-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold transition-colors ${
                              isHovered
                                ? 'bg-indigo-100 text-indigo-900 font-black'
                                : val > 0
                                ? 'text-slate-800 font-bold'
                                : 'text-slate-400 font-medium'
                            }`}
                          >
                            Sem {item.semester}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            {item.totalCourses} courses
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hover Inspection Bar */}
              {hoveredSem !== null && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      S{hoveredSem}
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-950 text-xs">
                        Semester {hoveredSem} Enrollment Overview
                      </h4>
                      <p className="text-[11px] text-indigo-700">
                        {semesterStats[hoveredSem - 1]?.registeredStudents || 0} Registered Students •{' '}
                        {semesterStats[hoveredSem - 1]?.totalEnrollments || 0} Course Registrations •{' '}
                        {semesterStats[hoveredSem - 1]?.totalCourses || 0} Courses in Catalog (8 per department)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-800 font-medium font-mono">
                      CS: {semesterStats[hoveredSem - 1]?.deptBreakdown?.CS || 0}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-800 font-medium font-mono">
                      DS: {semesterStats[hoveredSem - 1]?.deptBreakdown?.DS || 0}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-800 font-medium font-mono">
                      EE: {semesterStats[hoveredSem - 1]?.deptBreakdown?.EE || 0}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-800 font-medium font-mono">
                      MATH: {semesterStats[hoveredSem - 1]?.deptBreakdown?.MATH || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* Graphical Insights Footer Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Peak Registration Semester
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-1 block">
                    Sem {peakSem?.semester || 1} ({peakSem?.registeredStudents || 0} students)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total Active Enrollments
                  </span>
                  <span className="text-sm font-bold text-indigo-600 mt-1 block">
                    {stats.activeRegistrations} course registrations
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Courses Per Semester
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-1 block">
                    32 Courses (8 per department)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total Catalog Size
                  </span>
                  <span className="text-sm font-bold text-emerald-600 mt-1 block">
                    {stats.totalCourses} courses across 8 semesters
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sections Table & Capacity Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Course Sections & Live Seat Tracking</h3>
            <p className="text-xs text-slate-500">
              Monitor real-time capacity and modify seat limits
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4 whitespace-nowrap">Section</th>
                <th className="py-3 px-4">Faculty</th>
                <th className="py-3 px-4">Enrolled / Cap</th>
                <th className="py-3 px-4">Available (Redis)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sections.map((sec) => (
                <tr key={sec.sectionId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <span className="font-mono text-indigo-700 mr-2">{sec.courseCode}</span>
                    <span className="text-slate-700 font-normal">{sec.courseName}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {formatSectionDisplay(sec.sectionCode)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{sec.facultyName}</td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {sec.enrolled} / {sec.capacity}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {sec.available}
                  </td>
                  <td className="py-3 px-4">
                    <SeatBadge
                      status={sec.status}
                      available={sec.available}
                      capacity={sec.capacity}
                      showCount={false}
                    />
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSectionToEdit(sec);
                        setIsEditSectionOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit capacity"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(sec.courseId)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Add Course Modal */}
      {isAddCourseOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddCourseOpen(false)}
          title="Create New University Course"
          maxWidth="md"
        >
          <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Course Code</label>
              <input
                type="text"
                required
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="e.g. CS410"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Course Name</label>
              <input
                type="text"
                required
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="e.g. Advanced Distributed Systems"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Credits</label>
                <select
                  value={newCourseCredits}
                  onChange={(e) => setNewCourseCredits(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((cr) => (
                    <option key={cr} value={cr}>
                      {cr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Department</label>
                <select
                  value={newCourseDept}
                  onChange={(e) => setNewCourseDept(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                >
                  <option value={1}>CS</option>
                  <option value={2}>DS</option>
                  <option value={3}>EE</option>
                  <option value={4}>MATH</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Semester</label>
                <select
                  value={newCourseSemester}
                  onChange={(e) => setNewCourseSemester(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                rows={3}
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
                placeholder="Course syllabus summary..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddCourseOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
              >
                Save Course
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Section Modal */}
      {isAddSectionOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddSectionOpen(false)}
          title="Create New Section & Schedule"
          maxWidth="md"
        >
          <form onSubmit={handleCreateSection} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Course</label>
              <select
                value={sectionCourseId}
                onChange={(e) => setSectionCourseId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Section Code</label>
                <input
                  type="text"
                  required
                  value={sectionCode}
                  onChange={(e) => setSectionCode(e.target.value)}
                  placeholder="SEC-C"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Faculty Name</label>
                <input
                  type="text"
                  required
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="Dr. Evelyn Shaw"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Room</label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Lab-304"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Day</label>
                <select
                  value={scheduleDay}
                  onChange={(e) => setScheduleDay(e.target.value as any)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                >
                  <option value="MON">Monday</option>
                  <option value="TUE">Tuesday</option>
                  <option value="WED">Wednesday</option>
                  <option value="THU">Thursday</option>
                  <option value="FRI">Friday</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddSectionOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
              >
                Create Section
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Section Modal */}
      {isEditSectionOpen && sectionToEdit && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditSectionOpen(false)}
          title={`Edit Section ${sectionToEdit.sectionCode} (${sectionToEdit.courseCode})`}
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateSectionCapacity} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Seat Capacity (Redis updates live)
              </label>
              <input
                type="number"
                min={sectionToEdit.enrolled}
                required
                value={sectionToEdit.capacity}
                onChange={(e) =>
                  setSectionToEdit({ ...sectionToEdit, capacity: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Cannot be lower than currently enrolled students ({sectionToEdit.enrolled}).
              </span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Assigned Faculty
              </label>
              <input
                type="text"
                required
                value={sectionToEdit.facultyName}
                onChange={(e) =>
                  setSectionToEdit({ ...sectionToEdit, facultyName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditSectionOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Clear Student Data Confirmation Modal */}
      {isClearStudentsOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsClearStudentsOpen(false)}
          title="Clear All Student Data"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-2">
              <p className="font-black text-rose-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                This action cannot be undone
              </p>
              <p className="text-rose-700 leading-relaxed">
                The following data will be <strong>permanently deleted</strong>:
              </p>
              <ul className="list-disc list-inside text-rose-700 space-y-1 ml-1">
                <li>All registered student accounts (email &amp; password)</li>
                <li>All student profiles &amp; academic records</li>
                <li>All course enrollments</li>
                <li>All registration logs</li>
                <li>All completed course records</li>
              </ul>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <p className="font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                The following data will be <strong>fully preserved</strong>:
              </p>
              <ul className="list-disc list-inside text-emerald-700 space-y-1 ml-1 mt-1">
                <li>All 256 courses &amp; course catalog</li>
                <li>All course sections &amp; schedules</li>
                <li>All departments</li>
                <li>Admin account</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsClearStudentsOpen(false)}
                disabled={isClearingStudents}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearStudents}
                disabled={isClearingStudents}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-60 flex items-center gap-2"
              >
                {isClearingStudents ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Yes, Clear All Students
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
