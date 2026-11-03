"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireStudent = exports.requireRole = exports.authenticateJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const models_1 = require("../models");
const authenticateJwt = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Authentication required. Missing token.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        // Fetch user details from MongoDB
        const user = await models_1.User.findOne({ id: decoded.id });
        if (!user) {
            res.status(401).json({ success: false, error: 'User not found or session revoked.' });
            return;
        }
        const student = user.role === 'STUDENT' ? await models_1.Student.findOne({ user_id: user.id }) : null;
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            studentId: student ? student.id : undefined,
            studentCode: student ? student.student_id : undefined
        };
        next();
    }
    catch (err) {
        res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
};
exports.authenticateJwt = authenticateJwt;
const requireRole = (role) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
exports.requireStudent = (0, exports.requireRole)('STUDENT');
exports.requireAdmin = (0, exports.requireRole)('ADMIN');
