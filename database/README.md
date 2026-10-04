# Database Architecture (MERN Stack — MongoDB)

This project runs on the **MERN Stack** with **MongoDB** as its primary database.

## 📂 Active Database Files (MongoDB)
* **`database/mongo-init.js`**: Standard MongoDB initialization and seeder script. Creates collections, unique indexes, and seeds 22+ courses, prerequisites, faculty sections, timetables, and user accounts.
* **`backend/src/models/`**: Official Mongoose ODM schemas:
  * `User.ts`
  * `Student.ts`
  * `Department.ts`
  * `Course.ts` (with embedded prerequisite array)
  * `CourseSection.ts` (with embedded weekly timetable schedules)
  * `Enrollment.ts`
  * `CompletedCourse.ts`
  * `RegistrationLog.ts`
* **`backend/src/scripts/seed-mongo.ts`**: TypeScript script to seed MongoDB directly via Mongoose.

## 📦 How to Import into MongoDB Compass or mongosh
Run in terminal:
```bash
mongosh "mongodb://localhost:27017/course_registration" database/mongo-init.js
```

## 🗄️ Legacy PostgreSQL Backup
* **`database/legacy_postgres_sql/`**: Contains original SQL files (`schema.sql` and `seed.sql`) preserved from when the project was originally structured as PERN stack before converting to MERN stack.
