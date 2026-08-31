
const express = require("express");
const router = express.Router();
const controller  = require("../controllers/expenseReportController");


const auth = require("../middlewares/auth.middleware");

const authorize = require('../middlewares/authorize');

router.get("/summary", auth,authorize('manage expense'),controller. getExpenseSummary);

router.get("/IncomeSummary", auth,authorize('manage expense'),controller. getIncomeSummary);

module.exports = router;

