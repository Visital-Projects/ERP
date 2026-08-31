const express = require('express');
const router = express.Router();
const controller = require('../controllers/otherPayment.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize')

router.get('/', auth, controller.getAll);
router.get('/employee/:id', auth, controller.getByEmployeeId); 
router.post('/', auth, authorize('create other payment'), controller.create);
router.put('/:id', auth, authorize('edit other payment'), controller.update);
router.delete('/:id', auth, authorize('delete other payment'),  controller.remove);

module.exports = router;
