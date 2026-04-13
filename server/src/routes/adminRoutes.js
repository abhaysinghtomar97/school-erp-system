const express = require('express');
const {verifyToken }= require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Existing Routes
router.get('/', verifyToken, adminController.getdashboard);
router.post('/create-user', adminController.CreateUser);
router.get('/students', adminController.getStudents);
router.get('/faculty', adminController.getFaculty);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.post('/classes', adminController.createClass);
router.get('/classes', adminController.getClasses);
router.get('/classes/:class_id/roster', adminController.getClassRoster);
router.post('/enrollments', adminController.enrollStudent);

// --- TIMETABLE ROUTES ---
// We are now using your existing verifyToken middleware here
router.get('/timetable/class/:classId',  adminController.getClassTimetable);
router.post('/timetable/assign', adminController.assignTimetableSlot);

// Helper route for the frontend dropdowns (also protected)
router.get('/periods',  adminController.getAllPeriods); 
router.get('/subjects/class/:classId', adminController.getSubjectsByClass);

module.exports = router;