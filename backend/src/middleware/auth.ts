import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { User, Student } from '../models';
import { UserRole } from '../models/types';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  studentId?: number; // Primary key of students collection if role === 'STUDENT'
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

    // Fetch user details from MongoDB
    const user = await User.findOne({ id: decoded.id });

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found or session revoked.' });
      return;
    }

    const student = user.role === 'STUDENT' ? await Student.findOne({ user_id: user.id }) : null;

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      studentId: student ? student.id : undefined,
      studentCode: student ? student.student_id : undefined
    };

    next();
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ success: false, error: `Access denied. Requires ${role} privilege.` });
      return;
    }

    next();
  };
};

export const requireStudent = requireRole('STUDENT');
export const requireAdmin = requireRole('ADMIN');
