"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registrationController_1 = require("../controllers/registrationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJwt);
// Student registration
router.post('/', registrationController_1.RegistrationController.register);
// Drop registered course
router.delete('/:id', registrationController_1.RegistrationController.drop);
// View active registrations for student
router.get('/student/:studentId', registrationController_1.RegistrationController.getStudentRegistrations);
// View registration history audit logs
router.get('/history/:studentId', registrationController_1.RegistrationController.getHistory);
exports.default = router;
