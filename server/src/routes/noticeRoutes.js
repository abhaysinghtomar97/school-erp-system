const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { verifyToken } = require('../middlewares/authMiddleware');

// api/notice

router.get('/', verifyToken, noticeController.getNotices);

router.post('/', verifyToken, noticeController.createNotice);

router.get('/my-notices',verifyToken, noticeController.getMyNotices);

module.exports = router;