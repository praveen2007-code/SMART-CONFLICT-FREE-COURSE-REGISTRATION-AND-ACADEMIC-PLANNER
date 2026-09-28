import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, Student, Department } from '../models';
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
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Get next sequential numeric ID
    const lastUser = await User.findOne().sort({ id: -1 });
    const nextUserId = (lastUser?.id || 0) + 1;

    // Insert user
    const newUser = await User.create({
      id: nextUserId,
      name: data.name,
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      role: data.role
    });

    let studentRecord = null;
    if (data.role === 'STUDENT') {
      const deptId = data.departmentId || 1; // Default to CS
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const studentCode = `STU-2026-${randomSuffix}`;

      const lastStudent = await Student.findOne().sort({ id: -1 });
      const nextStudentId = (lastStudent?.id || 0) + 1;

      const newStudent = await Student.create({
        id: nextStudentId,
        user_id: newUser.id,
        student_id: studentCode,
        department_id: deptId,
        semester: data.semester,
        max_credits: 20,
        current_gpa: 3.75
      });

      const dept = await Department.findOne({ id: deptId });

      studentRecord = {
        id: newStudent.id,
        studentCode: newStudent.student_id,
        semester: newStudent.semester,
        maxCredits: newStudent.max_credits,
        currentGpa: newStudent.current_gpa,
        departmentName: dept?.name || 'Computer Science & Engineering',
        departmentCode: dept?.code || 'CS'
      };
    }

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        student: studentRecord
      }
    });
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    let studentData = null;
    if (user.role === 'STUDENT') {
      const student = await Student.findOne({ user_id: user.id });
      if (student) {
        const dept = await Department.findOne({ id: student.department_id });
        studentData = {
          id: student.id,
          studentCode: student.student_id,
          semester: student.semester,
          maxCredits: student.max_credits,
          currentGpa: student.current_gpa,
          departmentName: dept?.name || 'Computer Science',
          departmentCode: dept?.code || 'CS'
        };
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student: studentData
      }
    });
  }

  public static async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    let studentData = null;
    if (user.role === 'STUDENT') {
      const student = await Student.findOne({ user_id: user.id });
      if (student) {
        const dept = await Department.findOne({ id: student.department_id });
        studentData = {
          id: student.id,
          studentCode: student.student_id,
          semester: student.semester,
          maxCredits: student.max_credits,
          currentGpa: student.current_gpa,
          departmentName: dept?.name || 'Computer Science',
          departmentCode: dept?.code || 'CS'
        };
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student: studentData
      }
    });
  }
}
