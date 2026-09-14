-- ==========================================================
-- SMART COURSE REGISTRATION & ACADEMIC PLANNER SEED DATA
-- Comprehensive realistic academic data for 22+ courses,
-- prerequisites, sections, schedules, students, and admins
-- ==========================================================

-- Clean existing data
TRUNCATE TABLE registration_logs CASCADE;
TRUNCATE TABLE enrollments CASCADE;
TRUNCATE TABLE completed_courses CASCADE;
TRUNCATE TABLE schedules CASCADE;
TRUNCATE TABLE course_sections CASCADE;
TRUNCATE TABLE prerequisites CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE departments CASCADE;

-- 1. Departments
INSERT INTO departments (id, code, name) VALUES
(1, 'CS', 'Computer Science & Engineering'),
(2, 'DS', 'Data Science & Artificial Intelligence'),
(3, 'EE', 'Electrical & Computer Engineering'),
(4, 'MATH', 'Department of Mathematics');
ALTER SEQUENCE departments_id_seq RESTART WITH 5;

-- 2. Users (Bcrypt hash of 'password123' and 'admin123')
-- password123: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- admin123:    $2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Alex Rivera', 'student@university.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT'),
(2, 'Sarah Connor', 'student2@university.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT'),
(3, 'Dr. Marcus Vance (Admin)', 'admin@university.edu', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'ADMIN');
ALTER SEQUENCE users_id_seq RESTART WITH 4;

-- 3. Students
INSERT INTO students (id, user_id, student_id, department_id, semester, max_credits, current_gpa) VALUES
(1, 1, 'STU-2024-001', 1, 4, 20, 3.82),
(2, 2, 'STU-2024-042', 2, 3, 18, 3.65);
ALTER SEQUENCE students_id_seq RESTART WITH 3;

-- 4. Courses (22+ Courses)
INSERT INTO courses (id, code, name, credits, department_id, semester, description, is_core) VALUES
-- Foundation / Lower Division
(1, 'CS101', 'Introduction to Computer Science', 4, 1, 1, 'Fundamental computing concepts, algorithms, problem-solving in Python.', true),
(2, 'CS102', 'Object-Oriented Programming', 4, 1, 2, 'Object-oriented paradigm, classes, inheritance, polymorphism in Java/C++.', true),
(3, 'MATH101', 'Calculus I for Engineers', 4, 4, 1, 'Limits, derivatives, definite and indefinite integrals, and applications.', true),
(4, 'MATH102', 'Calculus II & Differential Equations', 4, 4, 2, 'Techniques of integration, series, and ordinary differential equations.', true),
(5, 'MATH201', 'Linear Algebra & Matrices', 3, 4, 3, 'Vector spaces, linear transformations, eigenvalues, eigenvectors.', true),
(6, 'CS201', 'Data Structures & Algorithms', 4, 1, 3, 'Arrays, linked lists, trees, graphs, sorting, searching, time complexity.', true),
(7, 'CS202', 'Discrete Mathematics', 3, 1, 2, 'Logic, sets, relations, graphs, combinatorics, proof methods.', true),
(8, 'EE201', 'Digital Logic & Computer Architecture', 3, 3, 3, 'Boolean algebra, logic gates, sequential circuits, CPU pipeline.', true),

-- Intermediate / Core Computer Science
(9, 'CS301', 'Database Management Systems', 4, 1, 4, 'Relational model, SQL, normalization, indexing, transaction management, ACID.', true),
(10, 'CS302', 'Operating Systems', 4, 1, 4, 'Processes, threads, CPU scheduling, synchronization, memory management, file systems.', true),
(11, 'CS303', 'Computer Networks', 3, 1, 4, 'OSI model, TCP/IP protocol suite, routing, switching, network security.', true),
(12, 'CS304', 'Software Engineering Principles', 3, 1, 4, 'Agile methodologies, system design, testing, version control, CI/CD.', true),
(13, 'CS305', 'Theory of Computation', 3, 1, 5, 'Automata theory, regular languages, context-free grammars, Turing machines, decidability.', true),

-- Advanced / Electives / Specializations
(14, 'CS401', 'Machine Learning Foundations', 4, 2, 5, 'Supervised/unsupervised learning, gradient descent, neural networks, evaluation metrics.', false),
(15, 'CS402', 'Artificial Intelligence', 3, 2, 5, 'Heuristic search, knowledge representation, game playing, Markov decision processes.', false),
(16, 'CS403', 'Cloud Computing & Distributed Systems', 3, 1, 5, 'Microservices, virtualization, containers, consensus algorithms, AWS/GCP.', false),
(17, 'CS404', 'Web Application Development', 3, 1, 4, 'Full-stack web apps, REST APIs, React, Node.js, state management, security.', false),
(18, 'CS405', 'Information & Network Security', 3, 1, 6, 'Cryptography, symmetric/asymmetric encryption, PKI, vulnerabilities, ethical hacking.', false),
(19, 'DS301', 'Data Mining & Warehousing', 3, 2, 5, 'ETL processes, association rules, clustering, dimensional modeling.', false),
(20, 'DS401', 'Deep Learning & Computer Vision', 4, 2, 6, 'CNNs, RNNs, Transformers, object detection, generative models, PyTorch.', false),
(21, 'DS402', 'Natural Language Processing', 3, 2, 6, 'Tokenization, embeddings, sequence models, sentiment analysis, LLMs.', false),
(22, 'CS499', 'Capstone Senior Design Project', 4, 1, 6, 'Comprehensive group software engineering capstone project.', true);
ALTER SEQUENCE courses_id_seq RESTART WITH 23;

-- 5. Course Prerequisites
INSERT INTO prerequisites (course_id, prerequisite_course_id) VALUES
(2, 1),   -- CS102 requires CS101
(6, 2),   -- CS201 (Data Structures) requires CS102
(6, 7),   -- CS201 requires CS202 (Discrete Math)
(8, 1),   -- EE201 requires CS101
(9, 6),   -- CS301 (DBMS) requires CS201 (Data Structures)
(10, 6),  -- CS302 (OS) requires CS201 (Data Structures)
(10, 8),  -- CS302 (OS) requires EE201 (Comp Arch)
(11, 6),  -- CS303 (Networks) requires CS201
(12, 6),  -- CS304 (SWE) requires CS201
(13, 7),  -- CS305 (Theory) requires CS202
(14, 6),  -- CS401 (Machine Learning) requires CS201 (Data Structures)
(14, 5),  -- CS401 (Machine Learning) requires MATH201 (Linear Algebra)
(15, 6),  -- CS402 (AI) requires CS201
(16, 10), -- CS403 (Cloud) requires CS302 (OS)
(17, 2),  -- CS404 (Web Dev) requires CS102
(18, 11), -- CS405 (Security) requires CS303 (Networks)
(19, 9),  -- DS301 requires CS301 (DBMS)
(20, 14), -- DS401 (Deep Learning) requires CS401 (ML)
(21, 14), -- DS402 (NLP) requires CS401 (ML)
(22, 12); -- CS499 (Capstone) requires CS304 (SWE)

-- 6. Course Sections
-- Note: Sections A and B designed to demonstrate scheduling and conflicts!
-- CS301 Sec-A is MON/WED 10:00-11:30
-- CS302 Sec-A is MON/WED 10:30-12:00 (Conflict with CS301 Sec-A!)
-- CS302 Sec-B is TUE/THU 14:00-15:30 (Conflict-free alternative!)
INSERT INTO course_sections (id, course_id, section_code, faculty_name, max_capacity, room_number, semester_term) VALUES
-- CS101
(1, 1, 'SEC-A', 'Prof. Alan Turing', 40, 'Hall-101', 'Fall 2026'),
(2, 1, 'SEC-B', 'Prof. Grace Hopper', 35, 'Hall-102', 'Fall 2026'),

-- CS201 Data Structures
(3, 6, 'SEC-A', 'Prof. Donald Knuth', 30, 'Hall-201', 'Fall 2026'),
(4, 6, 'SEC-B', 'Prof. Robert Sedgewick', 30, 'Hall-202', 'Fall 2026'),

-- CS301 DBMS
(5, 9, 'SEC-A', 'Dr. Edgar Codd', 25, 'Lab-301', 'Fall 2026'),
(6, 9, 'SEC-B', 'Dr. Michael Stonebraker', 25, 'Lab-302', 'Fall 2026'),

-- CS302 Operating Systems
(7, 10, 'SEC-A', 'Prof. Andrew Tanenbaum', 20, 'Room-401', 'Fall 2026'),
(8, 10, 'SEC-B', 'Dr. Linus Torvalds', 25, 'Room-402', 'Fall 2026'),

-- CS303 Computer Networks
(9, 11, 'SEC-A', 'Prof. Vint Cerf', 30, 'Room-403', 'Fall 2026'),
(10, 11, 'SEC-B', 'Dr. Radia Perlman', 30, 'Room-404', 'Fall 2026'),

-- CS304 Software Engineering
(11, 12, 'SEC-A', 'Dr. Martin Fowler', 35, 'Hall-303', 'Fall 2026'),

-- CS401 Machine Learning
(12, 14, 'SEC-A', 'Dr. Andrew Ng', 30, 'Lab-501', 'Fall 2026'),
(13, 14, 'SEC-B', 'Dr. Fei-Fei Li', 25, 'Lab-502', 'Fall 2026'),

-- CS402 Artificial Intelligence
(14, 15, 'SEC-A', 'Dr. Stuart Russell', 30, 'Room-503', 'Fall 2026'),

-- CS403 Cloud Computing
(15, 16, 'SEC-A', 'Prof. Werner Vogels', 25, 'Lab-504', 'Fall 2026'),

-- CS404 Web App Development
(16, 17, 'SEC-A', 'Prof. Tim Berners-Lee', 35, 'Lab-205', 'Fall 2026'),
(17, 17, 'SEC-B', 'Dr. Brendan Eich', 30, 'Lab-206', 'Fall 2026'),

-- CS405 Security
(18, 18, 'SEC-A', 'Prof. Bruce Schneier', 25, 'Room-405', 'Fall 2026'),

-- DS301 Data Mining
(19, 19, 'SEC-A', 'Dr. Jiawei Han', 25, 'Lab-305', 'Fall 2026'),

-- DS401 Deep Learning
(20, 20, 'SEC-A', 'Dr. Yann LeCun', 25, 'Lab-505', 'Fall 2026'),

-- MATH201 Linear Algebra
(21, 5, 'SEC-A', 'Prof. Gilbert Strang', 40, 'Hall-105', 'Fall 2026'),

-- CS499 Capstone
(22, 22, 'SEC-A', 'Dr. Margaret Hamilton', 20, 'Project-Lab', 'Fall 2026');
ALTER SEQUENCE course_sections_id_seq RESTART WITH 23;

-- 7. Section Schedules (Days & Times)
INSERT INTO schedules (section_id, day_of_week, start_time, end_time, building, room) VALUES
-- CS101 SEC-A: Mon/Wed 09:00 - 10:30
(1, 'MON', '09:00', '10:30', 'Turing Hall', '101'),
(1, 'WED', '09:00', '10:30', 'Turing Hall', '101'),

-- CS101 SEC-B: Tue/Thu 11:00 - 12:30
(2, 'TUE', '11:00', '12:30', 'Turing Hall', '102'),
(2, 'THU', '11:00', '12:30', 'Turing Hall', '102'),

-- CS201 SEC-A: Mon/Wed 11:30 - 13:00
(3, 'MON', '11:30', '13:00', 'Knuth Wing', '201'),
(3, 'WED', '11:30', '13:00', 'Knuth Wing', '201'),

-- CS201 SEC-B: Tue/Thu 09:00 - 10:30
(4, 'TUE', '09:00', '10:30', 'Knuth Wing', '202'),
(4, 'THU', '09:00', '10:30', 'Knuth Wing', '202'),

-- CS301 SEC-A (DBMS): MON & WED 10:00 - 11:30
(5, 'MON', '10:00', '11:30', 'Database Complex', 'Lab-301'),
(5, 'WED', '10:00', '11:30', 'Database Complex', 'Lab-301'),

-- CS301 SEC-B (DBMS): TUE & THU 10:00 - 11:30
(6, 'TUE', '10:00', '11:30', 'Database Complex', 'Lab-302'),
(6, 'THU', '10:00', '11:30', 'Database Complex', 'Lab-302'),

-- CS302 SEC-A (OS): MON & WED 10:30 - 12:00 (Direct overlap with CS301 SEC-A 10:00-11:30!)
(7, 'MON', '10:30', '12:00', 'Systems Block', 'Room-401'),
(7, 'WED', '10:30', '12:00', 'Systems Block', 'Room-401'),

-- CS302 SEC-B (OS): TUE & THU 14:00 - 15:30 (Conflict-free alternative!)
(8, 'TUE', '14:00', '15:30', 'Systems Block', 'Room-402'),
(8, 'THU', '14:00', '15:30', 'Systems Block', 'Room-402'),

-- CS303 SEC-A (Networks): MON & WED 14:00 - 15:30
(9, 'MON', '14:00', '15:30', 'Network Tower', 'Room-403'),
(9, 'WED', '14:00', '15:30', 'Network Tower', 'Room-403'),

-- CS303 SEC-B (Networks): FRI 09:00 - 12:00
(10, 'FRI', '09:00', '12:00', 'Network Tower', 'Room-404'),

-- CS304 SEC-A (SWE): TUE & THU 11:30 - 13:00
(11, 'TUE', '11:30', '13:00', 'Software Center', 'Hall-303'),
(11, 'THU', '11:30', '13:00', 'Software Center', 'Hall-303'),

-- CS401 SEC-A (ML): MON & WED 15:30 - 17:00
(12, 'MON', '15:30', '17:00', 'AI Pavilion', 'Lab-501'),
(12, 'WED', '15:30', '17:00', 'AI Pavilion', 'Lab-501'),

-- CS401 SEC-B (ML): TUE & THU 15:30 - 17:00
(13, 'TUE', '15:30', '17:00', 'AI Pavilion', 'Lab-502'),
(13, 'THU', '15:30', '17:00', 'AI Pavilion', 'Lab-502'),

-- CS402 SEC-A (AI): FRI 13:00 - 16:00
(14, 'FRI', '13:00', '16:00', 'AI Pavilion', 'Room-503'),

-- CS403 SEC-A (Cloud): TUE & THU 16:00 - 17:30
(15, 'TUE', '16:00', '17:30', 'Cloud Center', 'Lab-504'),
(15, 'THU', '16:00', '17:30', 'Cloud Center', 'Lab-504'),

-- CS404 SEC-A (Web Dev): MON & WED 13:00 - 14:30
(16, 'MON', '13:00', '14:30', 'Internet Hall', 'Lab-205'),
(16, 'WED', '13:00', '14:30', 'Internet Hall', 'Lab-205'),

-- CS404 SEC-B (Web Dev): FRI 10:00 - 13:00
(17, 'FRI', '10:00', '13:00', 'Internet Hall', 'Lab-206'),

-- CS405 SEC-A (Security): TUE & THU 08:30 - 10:00
(18, 'TUE', '08:30', '10:00', 'Cybersecurity Lab', 'Room-405'),
(18, 'THU', '08:30', '10:00', 'Cybersecurity Lab', 'Room-405'),

-- DS301 SEC-A: MON 16:00 - 18:30
(19, 'MON', '16:00', '18:30', 'Data Lab', 'Lab-305'),

-- DS401 SEC-A (Deep Learning): WED 16:00 - 19:00
(20, 'WED', '16:00', '19:00', 'Data Lab', 'Lab-505'),

-- MATH201 SEC-A: MON & WED 08:30 - 10:00
(21, 'MON', '08:30', '10:00', 'Math Annex', 'Hall-105'),
(21, 'WED', '08:30', '10:00', 'Math Annex', 'Hall-105'),

-- CS499 SEC-A: FRI 14:00 - 17:00
(22, 'FRI', '14:00', '17:00', 'Innovation Center', 'Project-Lab');

-- 8. Completed Courses for Demo Student (Alex Rivera, Student ID: 1)
-- Completed CS101, CS102, MATH101, MATH201, CS201, CS202, EE201
-- This qualifies Alex for CS301 (DBMS), CS302 (OS), CS303 (Networks), CS401 (Machine Learning), CS404 (Web Dev)
INSERT INTO completed_courses (student_id, course_id, grade, semester_taken) VALUES
(1, 1, 'A', 'Fall 2024'),    -- CS101
(1, 2, 'A-', 'Spring 2025'), -- CS102
(1, 3, 'B+', 'Fall 2024'),   -- MATH101
(1, 5, 'A', 'Spring 2025'),  -- MATH201 (Linear Algebra)
(1, 7, 'A', 'Spring 2025'),  -- CS202 (Discrete Math)
(1, 6, 'A', 'Fall 2025'),    -- CS201 (Data Structures)
(1, 8, 'B+', 'Fall 2025');   -- EE201 (Digital Logic)

-- Completed Courses for Sarah Connor (Student ID: 2)
INSERT INTO completed_courses (student_id, course_id, grade, semester_taken) VALUES
(2, 1, 'A', 'Fall 2024'),
(2, 3, 'A', 'Fall 2024'),
(2, 2, 'B+', 'Spring 2025');

-- 9. Initial Enrollments (Demo: Alex is enrolled in CS304 Software Engineering)
INSERT INTO enrollments (student_id, section_id, status, enrolled_at) VALUES
(1, 11, 'REGISTERED', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- 10. Audit Logs
INSERT INTO registration_logs (student_id, course_id, section_id, action, details) VALUES
(1, 12, 11, 'REGISTER', '{"courseCode": "CS304", "section": "SEC-A", "credits": 3, "timestamp": "2026-09-12T10:00:00Z"}');
