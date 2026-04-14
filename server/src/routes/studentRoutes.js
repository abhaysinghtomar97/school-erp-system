const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Import authentication middlewares
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// 1. Verify token exists
router.use(verifyToken);

// 2. Verify the user is a STUDENT
router.use(checkRole(['STUDENT']));

// --- Protected Student Endpoints ---
router.get('/timetable', studentController.getMyTimetable);
router.get('/attendance', studentController.getMyAttendance);
router.get('/assignments', studentController.getMyAssignmentsAndGrades);

module.exports = router;