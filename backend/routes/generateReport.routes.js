const express = require("express");
const router = express.Router();
const { downloadMonthlyReport } = require("../controllers/generateReport.controller");

const auth = require("../middlewares/auth.middleware");
const authorize = require('../middlewares/authorize'); 

router.get("/download-report",auth, authorize('manage download report'), downloadMonthlyReport);

module.exports = router;
