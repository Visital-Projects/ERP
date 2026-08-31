
const express = require('express');
const router = express.Router();
const controller = require('../controllers/contract_period.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// POST   /api/contract-periods
router.post('/', auth, authorize('create contract period'), controller.create);

// GET    /api/contract-periods
router.get('/', auth,  authorize('manage contract period'), controller.getAll);


router.get('/jobmode/:jobModeId', auth, controller.getByJobModeId);

router.get('/:id', auth, controller.getById);
router.put('/:id', auth, authorize('edit contract period'), controller.update);
router.patch('/:id', auth,  authorize('edit contract period'), controller.update);
router.delete('/:id', auth, authorize('delete contract period'), controller.remove);

module.exports = router;
