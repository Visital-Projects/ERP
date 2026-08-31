

// const express = require("express");
// const router = express.Router();
// const payslipController = require("../controllers/payslip.controller");
// const auth = require("../middlewares/auth.middleware");
// const authorize = require("../middlewares/authorize");


// router.post("/create", auth, authorize("create pay slip"), payslipController.createPayslipsForMonth);

// router.post("/bulk-create", auth, authorize("create pay slip"), payslipController.bulkCreatePayslipsForMonth);

// router.get("/:year/:month",auth,authorize("manage pay slip"), payslipController.getAllPayslips);

// router.delete("/:employee_id/soft-delete",auth,authorize("manage pay slip"),payslipController.softDeletePayslip);

// router.post("/bulk-payment", auth, authorize("manage pay slip"), payslipController.bulkPayment);

// module.exports = router;




const express = require("express");
const router = express.Router();
const payslipController = require("../controllers/payslip.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");


router.post("/create", auth, authorize("create pay slip"), payslipController.createPayslipsForMonth);

router.post("/bulk-create", auth, authorize("create pay slip"), payslipController.bulkCreatePayslipsForMonth);

router.get("/:year/:month",auth,authorize("manage pay slip"), payslipController.getAllPayslips);

router.delete("/:employee_id/soft-delete",auth,authorize("manage pay slip"),payslipController.softDeletePayslip);

router.post("/bulk-payment", auth, authorize("manage pay slip"), payslipController.bulkPayment);

module.exports = router;
