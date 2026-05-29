const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// api/notice


router.post('/notice', verifyToken, noticeController.createNotice);

router.get('/my-notices',verifyToken, noticeController.getMyNotices);

router.delete("/delete-notice/:id", verifyToken,checkRole(['ADMIN']), noticeController.deleteNotice);

module.exports = router;