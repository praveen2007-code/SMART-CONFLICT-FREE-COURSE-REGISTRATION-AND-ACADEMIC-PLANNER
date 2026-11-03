"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const courseRoutes_1 = __importDefault(require("./courseRoutes"));
const registrationRoutes_1 = __importDefault(require("./registrationRoutes"));
const plannerRoutes_1 = __importDefault(require("./plannerRoutes"));
const recommendationRoutes_1 = __importDefault(require("./recommendationRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const router = (0, express_1.Router)();
// Health Check
router.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Smart Course Registration API'
    });
});
// Mounted Routes
router.use('/auth', authRoutes_1.default);
router.use('/courses', courseRoutes_1.default);
router.use('/registrations', registrationRoutes_1.default);
router.use('/planner', plannerRoutes_1.default);
router.use('/recommendations', recommendationRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
exports.default = router;
