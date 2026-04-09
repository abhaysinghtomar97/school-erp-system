const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const verifyToken = require('../middlewares/authMiddleware');

// Notice we put verifyToken in the middle! It acts as a shield.
router.get('/my-classes', verifyToken, facultyController.getMyClasses);


module.exports = router; 