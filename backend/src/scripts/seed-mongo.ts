import bcrypt from 'bcryptjs';
import {
  Department,
  User,
  Student,
  Course,
  CourseSection,
  Enrollment,
  CompletedCourse,
  RegistrationLog
} from '../models';

export async function seedMongoDatabase() {
  console.log('🌱 Seeding MongoDB database with initial academic dataset...');

  // 1. Clear existing collections
  await Promise.all([
    Department.deleteMany({}),
    User.deleteMany({}),
    Student.deleteMany({}),
    Course.deleteMany({}),
    CourseSection.deleteMany({}),
    Enrollment.deleteMany({}),
    CompletedCourse.deleteMany({}),
    RegistrationLog.deleteMany({})
  ]);

  // 2. Departments
  const departments = [
    { id: 1, code: 'CS', name: 'Computer Science & Engineering' },
    { id: 2, code: 'DS', name: 'Data Science & Artificial Intelligence' },
    { id: 3, code: 'EE', name: 'Electrical & Computer Engineering' },
    { id: 4, code: 'MATH', name: 'Department of Mathematics' }
  ];
  await Department.insertMany(departments);

  // 3. Users (Student and Admin)
  const studentPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const users = [
    {
      id: 1,
      name: 'Alex Rivera',
      email: 'student@university.edu',
      password_hash: studentPasswordHash,
      role: 'STUDENT'
    },
    {
      id: 2,
      name: 'Sarah Connor',
      email: 'student2@university.edu',
      password_hash: studentPasswordHash,
      role: 'STUDENT'
    },
    {
      id: 3,
      name: 'Dr. Marcus Vance (Admin)',
      email: 'admin@university.edu',
      password_hash: adminPasswordHash,
      role: 'ADMIN'
    }
  ];
  await User.insertMany(users);

  // 4. Students
  const students = [
    {
      id: 1,
      user_id: 1,
      student_id: 'STU-2024-001',
      department_id: 1,
      semester: 4,
      max_credits: 20,
      current_gpa: 3.82
    },
    {
      id: 2,
      user_id: 2,
      student_id: 'STU-2024-042',
      department_id: 2,
      semester: 3,
      max_credits: 18,
      current_gpa: 3.65
    }
  ];
  await Student.insertMany(students);

  // 5. Courses (22 Courses with Prerequisites embedded)
  const courses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Computer Science',
      credits: 4,
      department_id: 1,
      semester: 1,
      description: 'Fundamental computing concepts, algorithms, problem-solving in Python.',
      is_core: true,
      prerequisites: []
    },
    {
      id: 2,
      code: 'CS102',
      name: 'Object-Oriented Programming',
      credits: 4,
      department_id: 1,
      semester: 2,
      description: 'Object-oriented paradigm, classes, inheritance, polymorphism in Java/C++.',
      is_core: true,
      prerequisites: [1]
    },
    {
      id: 3,
      code: 'MATH101',
      name: 'Calculus I for Engineers',
      credits: 4,
      department_id: 4,
      semester: 1,
      description: 'Limits, derivatives, definite and indefinite integrals, and applications.',
      is_core: true,
      prerequisites: []
    },
    {
      id: 4,
      code: 'MATH102',
      name: 'Calculus II & Differential Equations',
      credits: 4,
      department_id: 4,
      semester: 2,
      description: 'Techniques of integration, series, and ordinary differential equations.',
      is_core: true,
      prerequisites: [3]
    },
    {
      id: 5,
      code: 'MATH201',
      name: 'Linear Algebra & Matrices',
      credits: 3,
      department_id: 4,
      semester: 3,
      description: 'Vector spaces, linear transformations, eigenvalues, eigenvectors.',
      is_core: true,
      prerequisites: []
    },
    {
      id: 6,
      code: 'CS201',
      name: 'Data Structures & Algorithms',
      credits: 4,
      department_id: 1,
      semester: 3,
      description: 'Arrays, linked lists, trees, graphs, sorting, searching, time complexity.',
      is_core: true,
      prerequisites: [2, 7]
    },
    {
      id: 7,
      code: 'CS202',
      name: 'Discrete Mathematics',
      credits: 3,
      department_id: 1,
      semester: 2,
      description: 'Logic, sets, relations, graphs, combinatorics, proof methods.',
      is_core: true,
      prerequisites: []
    },
    {
      id: 8,
      code: 'EE201',
      name: 'Digital Logic & Computer Architecture',
      credits: 3,
      department_id: 3,
      semester: 3,
      description: 'Boolean algebra, logic gates, sequential circuits, CPU pipeline.',
      is_core: true,
      prerequisites: [1]
    },
    {
      id: 9,
      code: 'CS301',
      name: 'Database Management Systems',
      credits: 4,
      department_id: 1,
      semester: 4,
      description: 'Relational model, SQL, normalization, indexing, transaction management, ACID.',
      is_core: true,
      prerequisites: [6]
    },
    {
      id: 10,
      code: 'CS302',
      name: 'Operating Systems',
      credits: 4,
      department_id: 1,
      semester: 4,
      description: 'Processes, threads, CPU scheduling, synchronization, memory management, file systems.',
      is_core: true,
      prerequisites: [6, 8]
    },
    {
      id: 11,
      code: 'CS303',
      name: 'Computer Networks',
      credits: 3,
      department_id: 1,
      semester: 4,
      description: 'OSI model, TCP/IP protocol suite, routing, switching, network security.',
      is_core: true,
      prerequisites: [6]
    },
    {
      id: 12,
      code: 'CS304',
      name: 'Software Engineering Principles',
      credits: 3,
      department_id: 1,
      semester: 4,
      description: 'Agile methodologies, system design, testing, version control, CI/CD.',
      is_core: true,
      prerequisites: [6]
    },
    {
      id: 13,
      code: 'CS305',
      name: 'Theory of Computation',
      credits: 3,
      department_id: 1,
      semester: 5,
      description: 'Automata theory, regular languages, context-free grammars, Turing machines, decidability.',
      is_core: true,
      prerequisites: [7]
    },
    {
      id: 14,
      code: 'CS401',
      name: 'Machine Learning Foundations',
      credits: 4,
      department_id: 2,
      semester: 5,
      description: 'Supervised/unsupervised learning, gradient descent, neural networks, evaluation metrics.',
      is_core: false,
      prerequisites: [6, 5]
    },
    {
      id: 15,
      code: 'CS402',
      name: 'Artificial Intelligence',
      credits: 3,
      department_id: 2,
      semester: 5,
      description: 'Heuristic search, knowledge representation, game playing, Markov decision processes.',
      is_core: false,
      prerequisites: [6]
    },
    {
      id: 16,
      code: 'CS403',
      name: 'Cloud Computing & Distributed Systems',
      credits: 3,
      department_id: 1,
      semester: 5,
      description: 'Microservices, virtualization, containers, consensus algorithms, AWS/GCP.',
      is_core: false,
      prerequisites: [10]
    },
    {
      id: 17,
      code: 'CS404',
      name: 'Web Application Development',
      credits: 3,
      department_id: 1,
      semester: 4,
      description: 'Full-stack web apps, REST APIs, React, Node.js, state management, security.',
      is_core: false,
      prerequisites: [2]
    },
    {
      id: 18,
      code: 'CS405',
      name: 'Information & Network Security',
      credits: 3,
      department_id: 1,
      semester: 6,
      description: 'Cryptography, symmetric/asymmetric encryption, PKI, vulnerabilities, ethical hacking.',
      is_core: false,
      prerequisites: [11]
    },
    {
      id: 19,
      code: 'DS301',
      name: 'Data Mining & Warehousing',
      credits: 3,
      department_id: 2,
      semester: 5,
      description: 'ETL processes, association rules, clustering, dimensional modeling.',
      is_core: false,
      prerequisites: [9]
    },
    {
      id: 20,
      code: 'DS401',
      name: 'Deep Learning & Computer Vision',
      credits: 4,
      department_id: 2,
      semester: 6,
      description: 'CNNs, RNNs, Transformers, object detection, generative models, PyTorch.',
      is_core: false,
      prerequisites: [14]
    },
    {
      id: 21,
      code: 'DS402',
      name: 'Natural Language Processing',
      credits: 3,
      department_id: 2,
      semester: 6,
      description: 'Tokenization, embeddings, sequence models, sentiment analysis, LLMs.',
      is_core: false,
      prerequisites: [14]
    },
    {
      id: 22,
      code: 'CS499',
      name: 'Capstone Senior Design Project',
      credits: 4,
      department_id: 1,
      semester: 6,
      description: 'Comprehensive group software engineering capstone project.',
      is_core: true,
      prerequisites: [12]
    }
  ];
  await Course.insertMany(courses);

  // 6. Course Sections & Embedded Schedules
  const sections = [
    {
      id: 1,
      course_id: 1,
      section_code: 'SEC-A',
      faculty_name: 'Prof. Alan Turing',
      max_capacity: 40,
      enrolled_count: 0,
      room_number: 'Hall-101',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 1, day_of_week: 'MON', start_time: '09:00', end_time: '10:30', building: 'Turing Hall', room: '101' },
        { section_id: 1, day_of_week: 'WED', start_time: '09:00', end_time: '10:30', building: 'Turing Hall', room: '101' }
      ]
    },
    {
      id: 2,
      course_id: 1,
      section_code: 'SEC-B',
      faculty_name: 'Prof. Grace Hopper',
      max_capacity: 35,
      enrolled_count: 0,
      room_number: 'Hall-102',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 2, day_of_week: 'TUE', start_time: '11:00', end_time: '12:30', building: 'Turing Hall', room: '102' },
        { section_id: 2, day_of_week: 'THU', start_time: '11:00', end_time: '12:30', building: 'Turing Hall', room: '102' }
      ]
    },
    {
      id: 3,
      course_id: 6,
      section_code: 'SEC-A',
      faculty_name: 'Prof. Donald Knuth',
      max_capacity: 30,
      enrolled_count: 0,
      room_number: 'Hall-201',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 3, day_of_week: 'MON', start_time: '11:30', end_time: '13:00', building: 'Knuth Wing', room: '201' },
        { section_id: 3, day_of_week: 'WED', start_time: '11:30', end_time: '13:00', building: 'Knuth Wing', room: '201' }
      ]
    },
    {
      id: 4,
      course_id: 6,
      section_code: 'SEC-B',
      faculty_name: 'Prof. Robert Sedgewick',
      max_capacity: 30,
      enrolled_count: 0,
      room_number: 'Hall-202',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 4, day_of_week: 'TUE', start_time: '09:00', end_time: '10:30', building: 'Knuth Wing', room: '202' },
        { section_id: 4, day_of_week: 'THU', start_time: '09:00', end_time: '10:30', building: 'Knuth Wing', room: '202' }
      ]
    },
    {
      id: 5,
      course_id: 9,
      section_code: 'SEC-A',
      faculty_name: 'Dr. Edgar Codd',
      max_capacity: 25,
      enrolled_count: 0,
      room_number: 'Lab-301',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 5, day_of_week: 'MON', start_time: '10:00', end_time: '11:30', building: 'Database Complex', room: 'Lab-301' },
        { section_id: 5, day_of_week: 'WED', start_time: '10:00', end_time: '11:30', building: 'Database Complex', room: 'Lab-301' }
      ]
    },
    {
      id: 6,
      course_id: 9,
      section_code: 'SEC-B',
      faculty_name: 'Dr. Michael Stonebraker',
      max_capacity: 25,
      enrolled_count: 0,
      room_number: 'Lab-302',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 6, day_of_week: 'TUE', start_time: '10:00', end_time: '11:30', building: 'Database Complex', room: 'Lab-302' },
        { section_id: 6, day_of_week: 'THU', start_time: '10:00', end_time: '11:30', building: 'Database Complex', room: 'Lab-302' }
      ]
    },
    {
      id: 7,
      course_id: 10,
      section_code: 'SEC-A',
      faculty_name: 'Prof. Andrew Tanenbaum',
      max_capacity: 20,
      enrolled_count: 0,
      room_number: 'Room-401',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 7, day_of_week: 'MON', start_time: '10:30', end_time: '12:00', building: 'Systems Block', room: 'Room-401' },
        { section_id: 7, day_of_week: 'WED', start_time: '10:30', end_time: '12:00', building: 'Systems Block', room: 'Room-401' }
      ]
    },
    {
      id: 8,
      course_id: 10,
      section_code: 'SEC-B',
      faculty_name: 'Dr. Linus Torvalds',
      max_capacity: 25,
      enrolled_count: 0,
      room_number: 'Room-402',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 8, day_of_week: 'TUE', start_time: '14:00', end_time: '15:30', building: 'Systems Block', room: 'Room-402' },
        { section_id: 8, day_of_week: 'THU', start_time: '14:00', end_time: '15:30', building: 'Systems Block', room: 'Room-402' }
      ]
    },
    {
      id: 9,
      course_id: 11,
      section_code: 'SEC-A',
      faculty_name: 'Prof. Vint Cerf',
      max_capacity: 30,
      enrolled_count: 0,
      room_number: 'Room-403',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 9, day_of_week: 'MON', start_time: '14:00', end_time: '15:30', building: 'Network Tower', room: 'Room-403' },
        { section_id: 9, day_of_week: 'WED', start_time: '14:00', end_time: '15:30', building: 'Network Tower', room: 'Room-403' }
      ]
    },
    {
      id: 10,
      course_id: 11,
      section_code: 'SEC-B',
      faculty_name: 'Dr. Radia Perlman',
      max_capacity: 30,
      enrolled_count: 0,
      room_number: 'Room-404',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 10, day_of_week: 'FRI', start_time: '09:00', end_time: '12:00', building: 'Network Tower', room: 'Room-404' }
      ]
    },
    {
      id: 11,
      course_id: 12,
      section_code: 'SEC-A',
      faculty_name: 'Dr. Martin Fowler',
      max_capacity: 35,
      enrolled_count: 1,
      room_number: 'Hall-303',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 11, day_of_week: 'TUE', start_time: '11:30', end_time: '13:00', building: 'Software Center', room: 'Hall-303' },
        { section_id: 11, day_of_week: 'THU', start_time: '11:30', end_time: '13:00', building: 'Software Center', room: 'Hall-303' }
      ]
    },
    {
      id: 12,
      course_id: 14,
      section_code: 'SEC-A',
      faculty_name: 'Dr. Andrew Ng',
      max_capacity: 30,
      enrolled_count: 0,
      room_number: 'Lab-501',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 12, day_of_week: 'MON', start_time: '15:30', end_time: '17:00', building: 'AI Pavilion', room: 'Lab-501' },
        { section_id: 12, day_of_week: 'WED', start_time: '15:30', end_time: '17:00', building: 'AI Pavilion', room: 'Lab-501' }
      ]
    },
    {
      id: 13,
      course_id: 14,
      section_code: 'SEC-B',
      faculty_name: 'Dr. Fei-Fei Li',
      max_capacity: 25,
      enrolled_count: 0,
      room_number: 'Lab-502',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 13, day_of_week: 'TUE', start_time: '15:30', end_time: '17:00', building: 'AI Pavilion', room: 'Lab-502' },
        { section_id: 13, day_of_week: 'THU', start_time: '15:30', end_time: '17:00', building: 'AI Pavilion', room: 'Lab-502' }
      ]
    },
    {
      id: 14,
      course_id: 15,
      section_code: 'SEC-A',
      faculty_name: 'Dr. Stuart Russell',
      max_capacity: 30,
      enrolled_count: 0,
      room_number: 'Room-503',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 14, day_of_week: 'FRI', start_time: '13:00', end_time: '16:00', building: 'AI Pavilion', room: 'Room-503' }
      ]
    },
    {
      id: 15,
      course_id: 16,
      section_code: 'SEC-A',
      faculty_name: 'Prof. Werner Vogels',
      max_capacity: 25,
      enrolled_count: 0,
      room_number: 'Lab-504',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 15, day_of_week: 'TUE', start_time: '16:00', end_time: '17:30', building: 'Cloud Center', room: 'Lab-504' },
        { section_id: 15, day_of_week: 'THU', start_time: '16:00', end_time: '17:30', building: 'Cloud Center', room: 'Lab-504' }
      ]
    },
    {
      id: 16,
      course_id: 17,
      section_code: 'SEC-A',
      faculty_name: 'Prof. Tim Berners-Lee',
      max_capacity: 35,
      enrolled_count: 0,
      room_number: 'Lab-205',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 16, day_of_week: 'MON', start_time: '13:00', end_time: '14:30', building: 'Internet Hall', room: 'Lab-205' },
        { section_id: 16, day_of_week: 'WED', start_time: '13:00', end_time: '14:30', building: 'Internet Hall', room: 'Lab-205' }
      ]
    },
    {
      id: 17,
      course_id: 17,
      section_code: 'SEC-B',
      faculty_name: 'Dr. Brendan Eich',
      max_capacity: 30,
      enrolled_count: 0,
      room_number: 'Lab-206',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 17, day_of_week: 'FRI', start_time: '10:00', end_time: '13:00', building: 'Internet Hall', room: 'Lab-206' }
      ]
    },
    {
      id: 18,
      course_id: 18,
      section_code: 'SEC-A',
      faculty_name: 'Prof. Bruce Schneier',
      max_capacity: 25,
      enrolled_count: 0,
      room_number: 'Room-405',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 18, day_of_week: 'TUE', start_time: '08:30', end_time: '10:00', building: 'Cybersecurity Lab', room: 'Room-405' },
        { section_id: 18, day_of_week: 'THU', start_time: '08:30', end_time: '10:00', building: 'Cybersecurity Lab', room: 'Room-405' }
      ]
    },
    {
      id: 19,
      course_id: 19,
      section_code: 'SEC-A',
      faculty_name: 'Dr. Jiawei Han',
      max_capacity: 25,
      enrolled_count: 0,
      room_number: 'Lab-305',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 19, day_of_week: 'MON', start_time: '16:00', end_time: '18:30', building: 'Data Lab', room: 'Lab-305' }
      ]
    },
    {
      id: 20,
      course_id: 20,
      section_code: 'SEC-A',
      faculty_name: 'Dr. Yann LeCun',
      max_capacity: 25,
      enrolled_count: 0,
      room_number: 'Lab-505',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 20, day_of_week: 'WED', start_time: '16:00', end_time: '19:00', building: 'Data Lab', room: 'Lab-505' }
      ]
    },
    {
      id: 21,
      course_id: 5,
      section_code: 'SEC-A',
      faculty_name: 'Prof. Gilbert Strang',
      max_capacity: 40,
      enrolled_count: 0,
      room_number: 'Hall-105',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 21, day_of_week: 'MON', start_time: '08:30', end_time: '10:00', building: 'Math Annex', room: 'Hall-105' },
        { section_id: 21, day_of_week: 'WED', start_time: '08:30', end_time: '10:00', building: 'Math Annex', room: 'Hall-105' }
      ]
    },
    {
      id: 22,
      course_id: 22,
      section_code: 'SEC-A',
      faculty_name: 'Dr. Margaret Hamilton',
      max_capacity: 20,
      enrolled_count: 0,
      room_number: 'Project-Lab',
      semester_term: 'Fall 2026',
      schedules: [
        { section_id: 22, day_of_week: 'FRI', start_time: '14:00', end_time: '17:00', building: 'Innovation Center', room: 'Project-Lab' }
      ]
    }
  ];
  await CourseSection.insertMany(sections);

  // 7. Completed Courses for Alex Rivera (Student 1)
  const completed = [
    { id: 1, student_id: 1, course_id: 1, semester_completed: 1, grade: 'A' },
    { id: 2, student_id: 1, course_id: 2, semester_completed: 2, grade: 'A-' },
    { id: 3, student_id: 1, course_id: 3, semester_completed: 1, grade: 'B+' },
    { id: 4, student_id: 1, course_id: 5, semester_completed: 2, grade: 'A' },
    { id: 5, student_id: 1, course_id: 7, semester_completed: 2, grade: 'A' },
    { id: 6, student_id: 1, course_id: 6, semester_completed: 3, grade: 'A' },
    { id: 7, student_id: 1, course_id: 8, semester_completed: 3, grade: 'B+' },
    // Sarah Connor (Student 2)
    { id: 8, student_id: 2, course_id: 1, semester_completed: 1, grade: 'A' },
    { id: 9, student_id: 2, course_id: 3, semester_completed: 1, grade: 'A' },
    { id: 10, student_id: 2, course_id: 2, semester_completed: 2, grade: 'B+' }
  ];
  await CompletedCourse.insertMany(completed);

  // 8. Enrollments
  await Enrollment.create({
    id: 1,
    student_id: 1,
    section_id: 11,
    status: 'REGISTERED',
    enrolled_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  });

  // 9. Registration Logs
  await RegistrationLog.create({
    id: 1,
    student_id: 1,
    section_id: 11,
    action: 'ENROLL',
    status: 'SUCCESS',
    details: JSON.stringify({ courseCode: 'CS304', section: 'SEC-A', credits: 3 }),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  });

  console.log('✅ MongoDB database successfully populated with academic seed data.');
}

if (require.main === module) {
  // If run directly
  const { connectDB } = require('../config/db');
  const mongoose = require('mongoose');

  connectDB().then(async () => {
    await seedMongoDatabase();
    await mongoose.disconnect();
    process.exit(0);
  }).catch((err: any) => {
    console.error('Failed to seed:', err);
    process.exit(1);
  });
}
