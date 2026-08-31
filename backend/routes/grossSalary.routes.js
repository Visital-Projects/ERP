const express = require("express");
const router = express.Router();
const auth = require('../middlewares/auth.middleware');

const {
  generateGrossSalary,bulkCreateGrossSalaryPayslips,getAllGrossSalaryMonthwise,bulkGrossSalaryPayment, updateGrossSalary
} = require("../controllers/grossSalary.controller");

router.post(
  "/generategross/:employeeId",auth,
  generateGrossSalary
);

router.post(
  "/bulk-gross-salary",
  auth,
  bulkCreateGrossSalaryPayslips
);

router.get(
  "/getAllgrosssalary",
  auth,
  getAllGrossSalaryMonthwise
);

router.post(
  "/bulk-gross-payment",
  auth,
  bulkGrossSalaryPayment
);
router.put("/update", auth, updateGrossSalary);

module.exports = router;