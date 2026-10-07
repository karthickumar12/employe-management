const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/departments', jobController.getDepartments);
router.get('/', jobController.getAllJobs);
router.get('/recruiter/my-jobs', verifyToken, authorizeRoles('recruiter', 'admin'), jobController.getRecruiterJobs);
router.get('/:id', jobController.getJobById);
router.post('/', verifyToken, authorizeRoles('recruiter', 'admin'), jobController.createJob);
router.put('/:id', verifyToken, authorizeRoles('recruiter', 'admin'), jobController.updateJob);
router.delete('/:id', verifyToken, authorizeRoles('recruiter', 'admin'), jobController.deleteJob);

module.exports = router;
