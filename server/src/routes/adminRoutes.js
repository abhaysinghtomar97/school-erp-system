const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');


const router = express.Router();



// POST /api/admin
router.get('/', verifyToken, adminController.getdashboard )
router.post('/create-user', adminController.CreateUser )
router.get('/students', adminController.getStudents )
router.get('/faculty', adminController.getFaculty )
router.put('/users/:id/status', adminController.toggleUserStatus);
router.post('/classes', adminController.createClass);
router.get('/classes', adminController.getClasses);
router.get('/classes/:class_id/roster', adminController.getClassRoster);
router.post('/enrollments', adminController.enrollStudent);

module.exports = router;