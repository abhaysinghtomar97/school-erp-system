// src/routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');

// Import both middleware functions
const { verifyToken, checkRole } = require('../middlewares/authMiddleware'); 

// 1. First, verify they are logged in (this sets req.user)
router.use(verifyToken);

// 2. Second, verify they are actually a TEACHER
router.use(checkRole(['TEACHER'])); 

// --- Protected Endpoints ---
router.get('/schedule', facultyController.getMySchedule);
router.get('/class/:classId/roster', facultyController.getClassRoster);

module.exports = router;