const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require('../middlewares/authorize'); 

// Get summary report
router.get("/financial-summary", auth, authorize('manage report'), reportController.getFinancialReport);

module.exports = router;
