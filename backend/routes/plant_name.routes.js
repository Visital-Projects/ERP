
const express = require('express');
const router = express.Router();
const controller = require('../controllers/plant_name.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize'); 

router.post('/', auth,  authorize('create plant name'),  controller.create);
router.get('/', auth, authorize('manage plant name'),  controller.getAll);
router.get('/:id', auth,authorize('manage plant name'), controller.getById);
router.put('/:id', auth,  authorize('edit plant name'),  controller.update);
router.patch('/:id', auth, authorize('edit plant name'),  controller.update);
router.delete('/:id', auth,  authorize('delete plant name'),  controller.remove);
router.get('/jobmode/:jobModeId', auth, controller.getByJobModeId);


module.exports = router;
