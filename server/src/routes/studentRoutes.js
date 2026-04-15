const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Combine the middlewares into an array for cleaner reading
const studentAuth = [verifyToken, checkRole(['STUDENT'])];

// Apply the combined middleware to each route individually

router.get('/timetable', studentAuth, studentController.getMyTimetable);
router.get('/attendance', studentAuth, studentController.getMyAttendance);
router.get('/assignments', studentAuth, studentController.getMyAssignmentsAndGrades);

module.exports = router;