const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', verifyToken, reportController.getDashboardStats);
router.get('/analytics', verifyToken, reportController.getReports);
router.get('/notifications', verifyToken, reportController.getNotifications);
router.put('/notifications/:id/read', verifyToken, reportController.markNotificationRead);

module.exports = router;
