import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { query } from '../config/db';
import { UserRole } from '../models/types';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  studentId?: number; // Primary key of students table if role === 'STUDENT'
  studentCode?: string; // e.g. STU-2024-001
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateJwt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required. Missing token.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: number; email: string; role: UserRole };

    // Fetch user details and student record if applicable
    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.role, s.id as student_id, s.student_id as student_code
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ success: false, error: 'User not found or session revoked.' });
      return;
    }

    const row = userRes.rows[0];
    req.user = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as UserRole,
      studentId: row.student_id ? parseInt(row.student_id, 10) : undefined,
      studentCode: row.student_code
    };

    next();
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to ${roles.join(' or ')} accounts.`
      });
      return;
    }

    next();
  };
};
