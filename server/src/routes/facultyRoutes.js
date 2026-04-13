// src/routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');

// Import both middleware functions
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
// 1. First, verify they are logged in (this sets req.user)
router.use(verifyToken);
router.use(checkRole(['TEACHER']));

// --- Protected Endpoints ---
router.get('/schedule', facultyController.getMySchedule);
router.get('/class/:classId/roster', facultyController.getClassRoster);
// GET /api/faculty/class/:classId/attendance/:date
router.get('/class/:classId/attendance/:date', facultyController.getAttendance);

// POST /api/faculty/attendance
router.post('/attendance', facultyController.markAttendance);
router.get('/my-classes', facultyController.getMyClasses);

module.exports = router;