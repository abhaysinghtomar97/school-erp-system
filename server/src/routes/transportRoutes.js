const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// GET: /api/transport/allocation/3 (where 3 is the classId)
router.get('/allocation/:classId', verifyToken, checkRole(['ADMIN']), transportController.getClassTransportAllocation);

// POST: /api/transport/toggle
router.post('/toggle', verifyToken, checkRole(['ADMIN']), transportController.toggleTransportStatus);
router.get('/summary', verifyToken, checkRole(['ADMIN']), transportController.getTransportSummary);

module.exports = router;