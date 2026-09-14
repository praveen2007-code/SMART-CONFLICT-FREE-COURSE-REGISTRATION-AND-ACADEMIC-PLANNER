export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: number;
  user_id: number;
  student_id: string;
  department_id: number;
  department_name?: string;
  department_code?: string;
  semester: number;
  max_credits: number;
  current_gpa: number;
  name?: string;
  email?: string;
  created_at?: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  department_id: number;
  department_code?: string;
  department_name?: string;
  semester: number;
  description: string;
  is_core: boolean;
  prerequisites?: Prerequisite[];
  sections?: CourseSection[];
  created_at?: string;
}

export interface Prerequisite {
  course_id: number;
  prerequisite_course_id: number;
  code?: string;
  name?: string;
  credits?: number;
  satisfied?: boolean;
}

export interface CourseSection {
  id: number;
  course_id: number;
  course_code?: string;
  course_name?: string;
  credits?: number;
  section_code: string;
  faculty_name: string;
  max_capacity: number;
  room_number: string;
  semester_term: string;
  available_seats?: number;
  seat_status?: 'AVAILABLE' | 'ALMOST_FULL' | 'FULL';
  schedules?: Schedule[];
}

export interface Schedule {
  id?: number;
  section_id: number;
  day_of_week: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  start_time: string; // '10:00:00' or '10:00'
  end_time: string;   // '11:30:00' or '11:30'
  building?: string;
  room?: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  section_id: number;
  course_id?: number;
  course_code?: string;
  course_name?: string;
  section_code?: string;
  faculty_name?: string;
  credits?: number;
  status: 'REGISTERED' | 'DROPPED';
  enrolled_at: string;
  dropped_at?: string;
  schedules?: Schedule[];
}

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

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: ScheduleConflict[];
  totalCredits: number;
  prerequisiteIssues: {
    courseId: number;
    courseCode: string;
    missingPrerequisites: string[];
  }[];
}

export interface GeneratedScheduleCombination {
  score: number;
  totalCredits: number;
  sections: CourseSection[];
  conflicts: ScheduleConflict[];
  isConflictFree: boolean;
  prerequisitesMet: boolean;
}
