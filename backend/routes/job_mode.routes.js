const express = require('express');
const router = express.Router();
const controller = require('../controllers/job_mode.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize'); 

router.post('/', auth, authorize('create job mode'), controller.create);
router.get('/', auth, authorize('manage job mode'), controller.getAll);
router.get('/:id', auth, authorize('manage job mode'), controller.getById);
router.put('/:id', auth, authorize('edit job mode'), controller.update);
router.patch('/:id', auth, authorize('edit job mode'), controller.update);
router.delete('/:id', auth, authorize('delete job mode'), controller.remove);


router.get('/:id/branches', auth, authorize('manage job mode'), controller.getBranchesByJobMode);


module.exports = router;
