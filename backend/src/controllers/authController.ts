import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db';
import { ENV } from '../config/env';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'ADMIN']).default('STUDENT'),
  departmentId: z.number().int().positive().optional(),
  semester: z.number().int().min(1).max(8).optional().default(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [data.email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Insert user
    const userRes = await query<{ id: number; name: string; email: string; role: string }>(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM users), $1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [data.name, data.email.toLowerCase(), passwordHash, data.role]
    );
    const user = userRes.rows[0];

    let studentRecord = null;
    if (data.role === 'STUDENT') {
      const deptId = data.departmentId || 1; // Default to CS
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const studentCode = `STU-2026-${randomSuffix}`;

      const stuRes = await query(
        `INSERT INTO students (id, user_id, student_id, department_id, semester, max_credits, current_gpa)
         VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM students), $1, $2, $3, $4, 20, 3.75)
         RETURNING id, student_id, semester, max_credits, current_gpa`,
        [user.id, studentCode, deptId, data.semester]
      );
      studentRecord = stuRes.rows[0];
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student: studentRecord
      }
    });
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const data = loginSchema.parse(req.body);

    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role,
              s.id as student_id, s.student_id as student_code, s.semester, s.max_credits, s.current_gpa,
              d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       LEFT JOIN departments d ON d.id = s.department_id
       WHERE u.email ILIKE $1`,
      [data.email]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const row = userRes.rows[0];
    const isPasswordValid = await bcrypt.compare(data.password, row.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: row.id, email: row.email, role: row.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        student: row.student_id
          ? {
              id: row.student_id,
              studentCode: row.student_code,
              semester: row.semester,
              maxCredits: row.max_credits,
              currentGpa: parseFloat(row.current_gpa),
              departmentName: row.department_name,
              departmentCode: row.department_code
            }
          : null
      }
    });
  }

  public static async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.role,
              s.id as student_id, s.student_id as student_code, s.semester, s.max_credits, s.current_gpa,
              d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       LEFT JOIN departments d ON d.id = s.department_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const row = userRes.rows[0];

    res.json({
      success: true,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        student: row.student_id
          ? {
              id: row.student_id,
              studentCode: row.student_code,
              semester: row.semester,
              maxCredits: row.max_credits,
              currentGpa: parseFloat(row.current_gpa),
              departmentName: row.department_name,
              departmentCode: row.department_code
            }
          : null
      }
    });
  }
}
