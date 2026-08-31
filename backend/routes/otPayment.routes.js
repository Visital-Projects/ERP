const express = require("express");
const router = express.Router();
const auth = require('../middlewares/auth.middleware');

const {
  generateOTPayment,bulkCreateOTSalaryForMonth,bulkOTPaymentForMonth, getAllOTPayslips, updateOTPaymentAmount
} = require("../controllers/otPayment.controller");

router.post("/generate-ot-payment/:employeeId",auth, generateOTPayment);


router.post("/bulk-generate-ot-salary", auth, bulkCreateOTSalaryForMonth);

router.get("/ot-payslips", auth, getAllOTPayslips);

router.post("/bulk-ot-payment", auth, bulkOTPaymentForMonth);

router.put("/update", auth, updateOTPaymentAmount);

module.exports = router;