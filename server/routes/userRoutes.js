const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', verifyToken, authorizeRoles('admin'), userController.getAllUsers);
router.get('/candidates', verifyToken, authorizeRoles('admin', 'recruiter'), userController.getCandidates);
router.get('/recruiters', verifyToken, authorizeRoles('admin'), userController.getRecruiters);
router.put('/:id/status', verifyToken, authorizeRoles('admin'), userController.toggleUserStatus);
router.delete('/:id', verifyToken, authorizeRoles('admin'), userController.deleteUser);

module.exports = router;
