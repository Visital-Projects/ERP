// const express = require('express');
// const router = express.Router();
// const jobController = require('../controllers/job.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, jobController.getAllJobs);
// router.get('/:id', auth, jobController.getJobById);
// router.post('/', auth, jobController.createJob);
// router.put('/:id', auth, jobController.updateJob);
// router.delete('/:id', auth, jobController.deleteJob);

// module.exports = router;


const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, jobController.getAllJobs);
router.get('/:id', auth, jobController.getJobById);
router.post('/', auth, jobController.createJob);
router.put('/:id', auth, jobController.updateJob);
router.delete('/:id', auth, jobController.deleteJob);

module.exports = router;

