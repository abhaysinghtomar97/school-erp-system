const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();


router.post('/login', authController.login)
router.post('/change-password',verifyToken, authController.changePassword)

// 1. Session Verification Route
// If they have a valid cookie, verifyToken lets them through and we send back their decoded user info
router.get('/me', verifyToken, (req, res) => {
    return res.status(200).json({ user: req.user });
});

// 2. Secure Logout Route
// This tells the browser to instantly delete the httpOnly cookie
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    return res.status(200).json({ message: 'Successfully logged out' });
});

module.exports = router;