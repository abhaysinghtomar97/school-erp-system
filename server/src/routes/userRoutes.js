// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Route: GET /api/users/:id/profile
// Protected so only Admins (and maybe Teachers later) can view full profiles
router.get('/:id/profile', verifyToken, checkRole(['ADMIN']), userController.getUserProfile);

module.exports = router;