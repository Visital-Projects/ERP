// const express = require('express');
// const router = express.Router();
// const jobCategoryController = require('../controllers/job_category.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, jobCategoryController.getAllJobCategories);
// router.get('/:id', auth, jobCategoryController.getJobCategoryById);
// router.post('/', auth, jobCategoryController.createJobCategory);
// router.put('/:id', auth, jobCategoryController.updateJobCategory);
// router.delete('/:id', auth, jobCategoryController.deleteJobCategory);

// module.exports = router;


const express = require('express');
const router = express.Router();
const jobCategoryController = require('../controllers/job_category.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base: /api/job-categories

// Manage all job categories
router.get( '/', auth, authorize('manage job category'), jobCategoryController.getAllJobCategories );

// View single job category
router.get( '/:id', auth, authorize('manage job category'), jobCategoryController.getJobCategoryById );

// Create job category
router.post( '/', auth, authorize('create job category'), jobCategoryController.createJobCategory );

// Update job category
router.put( '/:id', auth, authorize('edit job category'), jobCategoryController.updateJobCategory );

// Delete job category
router.delete( '/:id', auth, authorize('delete job category'), jobCategoryController.deleteJobCategory );

// Base: /api/job-categories
// router.get('/', auth, authorize('manage job category'), jobCategoryController.getAllJobCategories);
// router.get('/:id', auth, authorize('manage job category'), jobCategoryController.getJobCategoryById);
// router.post('/', auth, authorize('create job category'), jobCategoryController.createJobCategory);
// router.put('/:id', auth, authorize('edit job category'), jobCategoryController.updateJobCategory);
// router.delete('/:id', auth, authorize('delete job category'), jobCategoryController.deleteJobCategory);




module.exports = router;
