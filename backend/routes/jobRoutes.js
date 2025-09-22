const express = require('express');
const router = express.Router();
const jobController = require('../controller/jobController');
const { protect, authorize } = require('../middleware/auth');

// Admin route to create a new job
router.route('/').post(protect, authorize('admin'), jobController.createJobPost);
router.get('/', protect, authorize('admin'), jobController.getAllJobPosts);
router.route('/:jobId')
    .put(protect, authorize('admin'), jobController.updateJobPost)
    .delete(protect, authorize('admin'), jobController.deleteJobPost);

router.get('/:jobId/eligible-students', protect, authorize('admin'), jobController.getEligibleStudents);

router.get('/:jobId/eligible-students/download', protect, authorize('admin'), jobController.downloadEligibleStudentsCSV);

// Student route to see jobs they are eligible for
// router.route('/eligible').get(protect, authorize('student'), jobController.getEligibleJobs);

module.exports = router;