// const express = require('express');
// const router = express.Router();
// const payslipTypeController = require('../controllers/payslipType.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, payslipTypeController.getAllPayslipTypes);
// router.post('/', auth, payslipTypeController.createPayslipType);
// router.put('/:id', auth, payslipTypeController.updatePayslipType);
// router.delete('/:id', auth, payslipTypeController.deletePayslipType);

// module.exports = router;



const express = require('express');
const router = express.Router();
const payslipTypeController = require('../controllers/payslipType.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base route: /api/payslip-types

// View all (manage permission covers listing)
router.get('/', auth, authorize('manage payslip type'), payslipTypeController.getAllPayslipTypes);

// View single
router.get('/:id', auth, authorize('manage payslip type'), payslipTypeController.getPayslipTypeById);

// Create
router.post('/', auth, authorize('create payslip type'), payslipTypeController.createPayslipType);

// Update
router.put('/:id', auth, authorize('edit payslip type'), payslipTypeController.updatePayslipType);

// Delete
router.delete('/:id', auth, authorize('delete payslip type'), payslipTypeController.deletePayslipType);

module.exports = router;
