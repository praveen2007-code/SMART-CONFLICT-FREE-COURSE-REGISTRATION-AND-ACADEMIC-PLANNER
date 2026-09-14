const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');

const db = newDb();
const pg = db.adapters.createPg();
const pool = new pg.Pool();

async function test() {
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

  let schema = fs.readFileSync(schemaPath, 'utf8').replace(/CREATE EXTENSION[^\n]+;/gi, '');
  let seed = fs.readFileSync(seedPath, 'utf8')
    .replace(/ALTER SEQUENCE[^\n]+;/gi, '')
    .replace(/TRUNCATE[^\n]+;/gi, '');

  await pool.query(schema);
  await pool.query(seed);
  console.log('SCHEMA & SEED APPLIED TO IN-MEMORY POSTGRES');

  const res = await pool.query(
    `SELECT u.id, u.name, u.email, u.password_hash, u.role,
            s.id as student_id, s.student_id as student_code, s.semester, s.max_credits, s.current_gpa,
            d.name as department_name, d.code as department_code
     FROM users u
     LEFT JOIN students s ON s.user_id = u.id
     LEFT JOIN departments d ON d.id = s.department_id
     WHERE u.email ILIKE $1`,
    ['student@university.edu']
  );

  console.log('DEMO STUDENT LOADED:', res.rows[0]);
  process.exit(0);
}

test().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
