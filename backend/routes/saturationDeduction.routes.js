

const express = require('express');
const router = express.Router();
const controller = require('../controllers/saturationDeduction.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');


router.get('/', auth, controller.getAll);
router.get('/employee/:id', auth, controller.getByEmployeeId);
router.post('/', auth, authorize('create saturation deduction'), controller.create);
router.put('/:id', auth, authorize('edit saturation deduction'), controller.update);
router.delete('/:id', auth, authorize('delete saturation deduction'), controller.remove);

module.exports = router;
