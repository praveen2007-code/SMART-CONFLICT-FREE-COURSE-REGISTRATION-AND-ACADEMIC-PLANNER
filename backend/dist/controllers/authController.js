"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const models_1 = require("../models");
const env_1 = require("../config/env");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['STUDENT', 'ADMIN']).default('STUDENT'),
    departmentId: zod_1.z.number().int().positive().optional(),
    semester: zod_1.z.number().int().min(1).max(8).optional().default(1)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
class AuthController {
    static async register(req, res) {
        const data = registerSchema.parse(req.body);
        // Check if user already exists
        const existing = await models_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            res.status(409).json({ success: false, error: 'An account with this email already exists.' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(data.password, salt);
        // Get next sequential numeric ID
        const lastUser = await models_1.User.findOne().sort({ id: -1 });
        const nextUserId = (lastUser?.id || 0) + 1;
        // Insert user
        const newUser = await models_1.User.create({
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
            const lastStudent = await models_1.Student.findOne().sort({ id: -1 });
            const nextStudentId = (lastStudent?.id || 0) + 1;
            const newStudent = await models_1.Student.create({
                id: nextStudentId,
                user_id: newUser.id,
                student_id: studentCode,
                department_id: deptId,
                semester: data.semester,
                max_credits: 20,
                current_gpa: 3.75
            });
            const dept = await models_1.Department.findOne({ id: deptId });
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
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, env_1.ENV.JWT_SECRET, { expiresIn: env_1.ENV.JWT_EXPIRES_IN });
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
    static async login(req, res) {
        const data = loginSchema.parse(req.body);
        const user = await models_1.User.findOne({ email: data.email.toLowerCase() });
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid email or password.' });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, error: 'Invalid email or password.' });
            return;
        }
        let studentData = null;
        if (user.role === 'STUDENT') {
            const student = await models_1.Student.findOne({ user_id: user.id });
            if (student) {
                const dept = await models_1.Department.findOne({ id: student.department_id });
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.ENV.JWT_SECRET, { expiresIn: env_1.ENV.JWT_EXPIRES_IN });
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
    static async getMe(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }
        const user = await models_1.User.findOne({ id: req.user.id });
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        let studentData = null;
        if (user.role === 'STUDENT') {
            const student = await models_1.Student.findOne({ user_id: user.id });
            if (student) {
                const dept = await models_1.Department.findOne({ id: student.department_id });
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
exports.AuthController = AuthController;
