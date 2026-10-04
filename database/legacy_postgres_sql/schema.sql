-- ==========================================================
-- SMART COURSE REGISTRATION & ACADEMIC PLANNER DATABASE SCHEMA
-- Normalized PostgreSQL Schema with Constraints and Indexes
-- ==========================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Students Table (Extends User with academic profile)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(30) NOT NULL UNIQUE,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    semester INTEGER NOT NULL DEFAULT 1 CHECK (semester >= 1 AND semester <= 10),
    max_credits INTEGER NOT NULL DEFAULT 20 CHECK (max_credits > 0),
    current_gpa NUMERIC(3, 2) DEFAULT 3.50 CHECK (current_gpa >= 0.0 AND current_gpa <= 4.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3 CHECK (credits >= 1 AND credits <= 6),
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    description TEXT,
    is_core BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Course Prerequisites
CREATE TABLE IF NOT EXISTS prerequisites (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT unique_course_prereq UNIQUE (course_id, prerequisite_course_id),
    CONSTRAINT check_no_self_prereq CHECK (course_id <> prerequisite_course_id)
);

-- 6. Course Sections
CREATE TABLE IF NOT EXISTS course_sections (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_code VARCHAR(10) NOT NULL, -- e.g. 'SEC-A', 'SEC-B'
    faculty_name VARCHAR(100) NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 30 CHECK (max_capacity > 0),
    room_number VARCHAR(50) NOT NULL,
    semester_term VARCHAR(20) NOT NULL DEFAULT 'Fall 2026',
    CONSTRAINT unique_section_per_course_term UNIQUE (course_id, section_code, semester_term)
);

-- 7. Section Schedules (Timetable Slots)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    building VARCHAR(50) DEFAULT 'Science Block',
    room VARCHAR(50) NOT NULL,
    CONSTRAINT check_start_before_end CHECK (start_time < end_time)
);

-- 8. Completed Courses (Student Academic History)
CREATE TABLE IF NOT EXISTS completed_courses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    grade VARCHAR(5) NOT NULL DEFAULT 'A',
    semester_taken VARCHAR(20) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_completed_course UNIQUE (student_id, course_id)
);

-- 9. Enrollments (Active or Dropped Course Registrations)
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'DROPPED')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dropped_at TIMESTAMP WITH TIME ZONE
);

-- Constraint: Prevent duplicate active registration for the same section
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_enrollment_per_section
ON enrollments (student_id, section_id)
WHERE status = 'REGISTERED';

-- 10. Registration History / Audit Logs
CREATE TABLE IF NOT EXISTS registration_logs (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    section_id INTEGER REFERENCES course_sections(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('REGISTER', 'DROP')),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
CREATE INDEX IF NOT EXISTS idx_sections_course ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_section ON schedules(section_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_section ON enrollments(section_id);
CREATE INDEX IF NOT EXISTS idx_prereqs_course ON prerequisites(course_id);
CREATE INDEX IF NOT EXISTS idx_completed_student ON completed_courses(student_id);
