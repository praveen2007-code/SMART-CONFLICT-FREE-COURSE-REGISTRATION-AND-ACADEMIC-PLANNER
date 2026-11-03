"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Courses list can be accessed with optional authentication for personalized prereq satisfaction
router.get('/', (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return (0, auth_1.authenticateJwt)(req, res, next);
    }
    next();
}, courseController_1.CourseController.getCourses);
router.get('/:id', courseController_1.CourseController.getCourseById);
router.get('/:id/prerequisites', courseController_1.CourseController.getPrerequisites);
router.get('/:id/seats', courseController_1.CourseController.getSeats);
exports.default = router;
