# 🎓 Smart Course Registration & Academic Planner

A modern, full-stack university course registration and automated academic planning platform built with **React, TypeScript, Node.js, Express.js, PostgreSQL, Redis, and Docker**.

---

## 📌 Problem Statement

Traditional university course registration suffers from scheduling collisions, missing prerequisite mistakes, sudden seat unavailability, and administrative bottlenecks. **SmartPlanner** solves these challenges by combining:
1. **Real-time seat availability & concurrency handling** powered by Redis.
2. **Normalized relational integrity & audit logging** in PostgreSQL.
3. A unique **Smart Conflict-Free Course Planner** with combinatorial schedule optimization.
4. **Personalized academic recommendations** based on degree pathway requirements and completed transcript history.
5. **Administrative control** for courses, sections, faculty, and capacity monitoring.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript (Strict ESM/CJS), Zod |
| **Database** | PostgreSQL 16 (Normalized schema, foreign keys, unique constraints, indexes) |
| **Cache & Concurrency** | Redis 7 (`ioredis`, atomic seat counters `INCR`/`DECR`, lock TTLs) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt password hashing, RBAC (`STUDENT`, `ADMIN`) |
| **DevOps & Containerization** | Docker, Docker Compose, Nginx reverse proxy |

---

## 🚀 Key Features

### 1. 🧑‍🎓 Student Portal
- **Overview Dashboard**: Credit meter, active enrollments, upcoming schedule, GPA status, and quick suggestions.
- **Course Catalog**: Search and multi-criteria filters (department, semester, credits, core/elective).
- **Live Seat Badges**:
  - 🟢 **Available** (> 5 seats)
  - 🟡 **Almost Full** (1–5 seats remaining)
  - 🔴 **Full** (0 seats remaining)
- **Detailed Course Modals**: Syllabus description, prerequisites verification, faculty assignments, classrooms, and section schedules.
- **My Courses**: Manage enrolled sections with confirmation dialogs and instant seat release on drop.
- **Weekly Timetable**: Visual interactive Monday–Friday calendar grid with color-coded slots and classroom buildings.
- **Academic Recommendations**: Recommends eligible courses based on student's completed courses and prerequisites.
- **Audit Logs & History**: Immutable chronological record of all registration and drop operations.
- **Student Profile**: Degree standing, major, cumulative GPA, and completed course transcript.

### 2. ⚡ UNIQUE FEATURE: Smart Conflict-Free Course Planner
Select any set of courses or load the demo clash scenario:
- **Collision Detection**: Real-time interval overlap check across weekday schedules.
- **Instant Collision Warning**:
  ```
  Schedule Conflict Detected
  CS301 (Database Management): MON 10:00 AM – 11:30 AM
  CS302 (Operating Systems):    MON 10:30 AM – 12:00 PM
  ```
- **Automated Alternative Suggestion**:
  ```
  Suggested Alternative:
  Operating Systems – Section B
  TUE, THU 2:00 PM – 3:30 PM | 🟢 Seats Available: 25
  [ Apply Alternative ]
  ```
- **"Generate Best Schedule" Button**: Automatically evaluates permutations and ranks schedules using a 6-factor score:
  1. Timetable collision freedom (mandatory)
  2. All prerequisites satisfied (+100 pts)
  3. Core/required courses prioritized (+50 pts)
  4. More seats available (+20 pts)
  5. Student time preferences (Morning / Afternoon) (+15 pts)
  6. Balanced semester credit load (+10 pts)

### 3. 🛡️ Redis Concurrency & Seat Management
- **Atomic Operations**: Seats are decremented via Redis `DECR` and incremented on drop with `INCR`.
- **Race Condition Prevention**: Temporary lock key `lock:registration:{studentId}:{sectionId}` prevents double submission and overbooking.
- **PostgreSQL Transaction**: Once Redis validates seat availability, enrollment is persisted inside an ACID database transaction. If the database transaction aborts, the seat is automatically restored in Redis.

### 4. 🏢 Admin Dashboard
- System-wide metric widgets: Total students, total courses, active registrations, full sections, low enrollment alerts (< 4 students).
- **Course Management**: Create, edit, and delete courses.
- **Section Management**: Assign faculty, room numbers, capacities, and meeting day/time slots.
- **Live Seat Editing**: Instantly modify section capacity; changes immediately synchronize into Redis.
- **Registration Monitor**: Real-time university-wide enrollment audit feed.

---

## 🔑 Demo Accounts

For immediate testing, use the pre-seeded demo accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@university.edu` | `password123` | Alex Rivera (CS Major, Sem 4, 3.82 GPA, completed CS101, CS102, MATH101, MATH201, CS201) |
| **Student 2** | `student2@university.edu` | `password123` | Sarah Connor (Data Science Major, Sem 3) |
| **Administrator** | `admin@university.edu` | `admin123` | Dr. Marcus Vance (Full Administrative Control) |

*Note: The login page includes 1-click **Instant Demo Account** buttons to autofill these credentials.*

---

## 🐳 Quick Start with Docker Compose

Start the entire stack (PostgreSQL, Redis, Express Backend, and React Frontend) with a single command:

```bash
# Clone the repository
git clone https://github.com/your-username/course-registration-planner.git
cd course-registration-planner

# Start all services
docker-compose up --build
```

### Access URLs:
- **Frontend Web UI**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000/api`
- **API Health Check**: `http://localhost:5000/api/health`
- **PostgreSQL Database**: `localhost:5432` (database: `course_registration_db`)
- **Redis Cache**: `localhost:6379`

---

## 💻 Standalone Local Development

If you prefer to run services individually on your machine:

### Prerequisites:
- Node.js >= 18
- PostgreSQL 14+ (or Docker running PostgreSQL)
- Redis 6+ (or in-memory fallback)

### 1. Backend Setup
```bash
cd backend
npm install
npm run build
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start on `http://localhost:3000`.

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register`: Register new student account
- `POST /api/auth/login`: Authenticate and receive JWT
- `GET /api/auth/me`: Get current authenticated user profile

### Courses
- `GET /api/courses`: List courses with search, department, semester, live seat counts & prereq status
- `GET /api/courses/:id`: Get single course details
- `GET /api/courses/:id/prerequisites`: Get course prerequisite tree
- `GET /api/courses/:id/seats`: Get real-time seat counts for all sections

### Registrations
- `POST /api/registrations`: Register for a section (Protected by Redis concurrency lock)
- `DELETE /api/registrations/:id`: Drop course and release seat
- `GET /api/registrations/student/:studentId`: List active enrollments
- `GET /api/registrations/history/:studentId`: Audit logs of registrations and drops

### Smart Planner
- `POST /api/planner/check-conflicts`: Detect schedule collisions & suggest alternative sections
- `POST /api/planner/generate`: Combinatorial optimizer generating the best ranked timetable

### Recommendations
- `GET /api/recommendations/:studentId`: Personalized course suggestions based on completed credits & prerequisites

### Admin
- `GET /api/admin/stats`: Overview metrics, full courses & low-enrollment sections
- `GET /api/admin/registrations`: University-wide registration feed
- `POST /api/admin/courses`: Create course
- `PUT /api/admin/courses/:id`: Update course
- `DELETE /api/admin/courses/:id`: Delete course
- `POST /api/admin/sections`: Create section with schedule slots
- `PUT /api/admin/sections/:id`: Update section capacity (auto-synced to Redis)

---

## 🧪 Testing the Conflict-Free Planner Demo

1. Log in with **Demo Student** (`student@university.edu` / `password123`).
2. Navigate to **Smart Course Planner** in the sidebar.
3. Click the amber **"Load Conflict Demo Scenario"** button.
4. You will immediately see:
   - Schedule Status changes to **Schedule Conflict Detected**.
   - Direct time clash highlighted: `CS301` (10:00–11:30 AM) vs `CS302` (10:30–12:00 PM).
   - Suggested Alternative displayed: `Operating Systems – Section B` (2:00 PM – 3:30 PM).
   - Click **"Apply Alternative"** to resolve the collision instantly, or click **"Generate Best Schedule"** to let the optimizer automatically resolve the conflicts across all selected courses!
