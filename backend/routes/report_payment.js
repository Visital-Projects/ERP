const express = require('express');
const router = express.Router();

const reportPaymentController = require('../controllers/report_payment.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');   // ✅ ensure correct path
const upload = require('../middlewares/upload.middleware');


router.get('/employee/summary', auth, authorize('manage employee'), reportPaymentController.getAllEmployeesSummary);
router.get('/employee/Salary', auth, authorize('manage employee'), reportPaymentController.getAllEmployeesSalary );

module.exports = router;