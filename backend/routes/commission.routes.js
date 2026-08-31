

const express = require('express');
const router = express.Router();
const controller = require('../controllers/commission.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

router.use(auth);

router.post('/', auth, authorize('create commission'), controller.createCommission);
router.get('/', auth ,  controller.getAllCommissions);
router.get('/employee/:id', auth , controller.getCommissionsByEmployeeId);
router.put('/:id',auth, authorize('edit commission'), controller.updateCommission);
router.delete('/:id',auth, authorize('delete commission'), controller.deleteCommission);

module.exports = router;
