const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/change-password
// Note: In a real app, this route must be protected by a middleware verifying the JWT.
// We are building the raw route first.

router.post('/login', authController.login)
router.post('/change-password', authController.changePassword)



module.exports = router;