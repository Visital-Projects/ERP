const express = require('express');
const router = express.Router();
const controller = require('../controllers/job_application.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, controller.getAllApplications);
router.get('/:id', auth, controller.getApplicationById);
router.post('/', auth, controller.createApplication);
router.put('/:id', auth, controller.updateApplication);
router.delete('/:id', auth, controller.deleteApplication);

module.exports = router;

