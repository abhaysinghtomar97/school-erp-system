// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');


// Route: GET /api/users/:id/profile
// Admins can view any profile. (You can adjust roles as needed)
router.get('/:id/profile', verifyToken, checkRole(['ADMIN']), userController.getUserProfile);

// Route: GET /api/users/me/profile
// Dedicated route for a logged-in user to fetch their own data
router.get('/me/profile', verifyToken, userController.getUserProfile);
router.patch('/:id/profile', verifyToken, checkRole(['ADMIN']), userController.updateProfileField);

module.exports = router;