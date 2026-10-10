const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', verifyToken, reportController.getDashboardStats);
router.get('/analytics', verifyToken, reportController.getReports);
router.get('/notifications', verifyToken, reportController.getNotifications);
router.put('/notifications/:id/read', verifyToken, reportController.markNotificationRead);

// Email Notification History & Outbox Viewer (Admin Only)
router.get('/email-logs', verifyToken, authorizeRoles('admin'), reportController.getEmailLogs);
router.post('/email-logs/:id/retry', verifyToken, authorizeRoles('admin'), reportController.retryEmail);

module.exports = router;
