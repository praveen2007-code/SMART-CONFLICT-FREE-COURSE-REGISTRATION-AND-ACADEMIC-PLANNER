import React, { useState, useEffect } from 'react';
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
  Search
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [fullCourses, setFullCourses] = useState<any[]>([]);
  const [lowEnrollment, setLowEnrollment] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<any>(null);

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
      const [statsRes, regRes, coursesRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getRegistrations(),
        api.courses.getAll()
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        setSections(statsRes.sections);
        setFullCourses(statsRes.fullCourses);
        setLowEnrollment(statsRes.lowEnrollmentCourses);
      }

      if (regRes.success) {
        setRegistrations(regRes.registrations);
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
                <th className="py-3 px-4">Section</th>
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
                  <td className="py-3 px-4 font-mono font-bold">Sec {sec.sectionCode}</td>
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

      {/* University Active Registrations Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Active Registrations Feed</h3>
            <p className="text-xs text-slate-500">Live stream of student enrollments</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {registrations.length} recent
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course Enrolled</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{reg.student_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {reg.student_code}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-indigo-700">{reg.course_code}</span>
                    <span className="text-slate-600 block text-[11px]">{reg.course_name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">Sec {reg.section_code}</td>
                  <td className="py-3 px-4 font-bold">{reg.credits} cr</td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(reg.enrolled_at).toLocaleString()}
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
    </div>
  );
};
