const express = require('express');
const feeController = require('../controllers/feeController.js');
const { checkRole, verifyToken } = require('../middlewares/authMiddleware.js');

const router = express.Router();

// 1. Get all students in a class with their fee dues
router.get('/class/:classId', verifyToken, checkRole(['ADMIN']), feeController.getClassStudentsWithFees);

// 2. Batch generate invoices for a class
router.post('/batch-generate', verifyToken, checkRole(['ADMIN']), feeController.batchGenerateClassFees);

// 3. Get specific unpaid invoices for a single student (for the payment modal)
router.get('/student-dues/:studentId', verifyToken, checkRole(['ADMIN']), feeController.getStudentDueInvoices);

// 4. Record a payment (Your existing route)
router.post('/transactions', verifyToken, checkRole(['ADMIN']), feeController.recordPayment);

// --- Add these inside feeRoutes.js ---
router.get('/types', verifyToken, checkRole(['ADMIN']), feeController.getFeeTypes);
router.get('/structures', verifyToken, checkRole(['ADMIN']), feeController.getFeeStructures);
router.post('/structures', verifyToken, checkRole(['ADMIN']), feeController.createFeeStructure);

// 5. Get recent payment history
router.get('/history', verifyToken, checkRole(['ADMIN']), feeController.getFeeHistory);

// Add this with your other fee routes
router.get('/student/:studentId/ledger', verifyToken, checkRole(['ADMIN']), feeController.getStudentFeeLedger);

router.post('/pay-month', verifyToken, checkRole(['ADMIN']), feeController.payMonthDues);

module.exports = router;