export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  student?: {
    id: number;
    studentCode: string;
    semester: number;
    maxCredits: number;
    currentGpa?: number;
    departmentName: string;
    departmentCode: string;
  } | null;
}

export interface Prerequisite {
  prerequisiteCourseId: number;
  code: string;
  name: string;
  satisfied?: boolean;
}

export interface Schedule {
  id?: number;
  section_id: number;
  day_of_week: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  start_time: string;
  end_time: string;
  building?: string;
  room?: string;
}

export type SeatStatus = 'AVAILABLE' | 'ALMOST_FULL' | 'FULL';

export interface CompletedCourse {
  id: number;
  student_id: number;
  course_id: number;
  course_code?: string;
  course_name?: string;
  credits?: number;
  grade: string;
  semester_taken: string;
}

export interface CourseSection {
  id: number;
  courseId: number;
  courseCode?: string;
  courseName?: string;
  credits?: number;
  sectionCode: string;
  facultyName: string;
  maxCapacity: number;
  roomNumber: string;
  semesterTerm: string;
  availableSeats: number;
  seatStatus: SeatStatus;
  schedules: Schedule[];
}

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  semester: number;
  description: string;
  isCore: boolean;
  isCompleted?: boolean;
  isRegistered?: boolean;
  satisfiesPrerequisites?: boolean;
  prerequisites: Prerequisite[];
  totalAvailableSeats: number;
  sections: CourseSection[];
}

export interface Registration {
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  semester: number;
  departmentName: string;
  sectionId: number;
  sectionCode: string;
  facultyName: string;
  roomNumber: string;
  enrolledAt: string;
  schedules: Schedule[];
}

export interface ScheduleConflict {
  course1: {
    id: number;
    code: string;
    name: string;
    section: string;
    time: string;
    day: string;
  };
  course2: {
    id: number;
    code: string;
    name: string;
    section: string;
    time: string;
    day: string;
  };
  suggestedAlternative?: {
    courseId: number;
    courseCode: string;
    courseName: string;
    sectionId: number;
    sectionCode: string;
    time: string;
    availableSeats: number;
  };
}

export interface ConflictCheckResponse {
  success: boolean;
  scheduleStatus: string;
  hasConflicts: boolean;
  conflicts: ScheduleConflict[];
  totalCredits: number;
  prerequisiteIssues: {
    courseId: number;
    courseCode: string;
    missingPrerequisites: string[];
  }[];
}

export interface GeneratedScheduleResponse {
  success: boolean;
  bestSchedule: {
    score: number;
    sections: CourseSection[];
    totalCredits: number;
    breakdown: {
      conflictsCount: number;
      prereqsMet: boolean;
      coreCoursesCount: number;
      averageAvailableSeats: number;
      timePreferenceScore: number;
    };
    status: 'OPTIMAL' | 'CONFLICTS_FOUND';
  } | null;
  alternatives: {
    score: number;
    totalCredits: number;
    conflictsCount: number;
    sections: {
      id: number;
      courseCode: string;
      courseName: string;
      sectionCode: string;
      availableSeats: number;
    }[];
  }[];
  recommendations: string[];
}

export interface AcademicRecommendation {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  departmentName: string;
  semester: number;
  isCore: boolean;
  eligible: boolean;
  priorityScore: number;
  reason: string;
  prerequisites: {
    prereqCode: string;
    prereqName: string;
    satisfied: boolean;
  }[];
}

export interface RegistrationLog {
  id: number;
  student_id: number;
  action: 'REGISTER' | 'DROP';
  details: {
    courseCode?: string;
    sectionCode?: string;
    credits?: number;
    timestamp?: string;
    droppedAt?: string;
  };
  created_at: string;
  course_code?: string;
  course_name?: string;
}

export interface AdminStats {
  totalStudents: number;
  totalCourses: number;
  activeRegistrations: number;
  fullCoursesCount: number;
  lowEnrollmentCount: number;
}
