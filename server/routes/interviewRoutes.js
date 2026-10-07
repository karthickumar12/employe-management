const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', verifyToken, authorizeRoles('recruiter', 'admin'), interviewController.scheduleInterview);
router.get('/', verifyToken, interviewController.getInterviews);
router.put('/:id/status', verifyToken, authorizeRoles('recruiter', 'admin'), interviewController.updateInterviewStatus);

module.exports = router;
