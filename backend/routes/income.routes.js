const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/income.controller'); // path to controller
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');
// Get Income Summary
router.get('/', auth,authorize('manage income'), incomeController.getIncomeSummary);
router.get("/transaction-history", auth,authorize('manage income'), incomeController.getTransactionHistory);

module.exports = router;
