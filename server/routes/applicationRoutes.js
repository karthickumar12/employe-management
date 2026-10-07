const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const uploadResume = require('../middleware/uploadMiddleware');

router.post('/apply', verifyToken, authorizeRoles('candidate'), uploadResume.single('resume'), applicationController.applyForJob);
router.post('/upload-resume', verifyToken, authorizeRoles('candidate'), uploadResume.single('resume'), applicationController.uploadResume);
router.get('/my-applications', verifyToken, authorizeRoles('candidate'), applicationController.getMyApplications);
router.get('/track/:id', verifyToken, applicationController.getApplicationTracking);
router.delete('/:id/withdraw', verifyToken, authorizeRoles('candidate'), applicationController.withdrawApplication);

router.get('/recruiter/applicants', verifyToken, authorizeRoles('recruiter', 'admin'), applicationController.getApplicants);
router.put('/:id/status', verifyToken, authorizeRoles('recruiter', 'admin'), applicationController.updateApplicationStatus);
router.get('/resume/:resumeId', verifyToken, applicationController.getResumeFile);

module.exports = router;
