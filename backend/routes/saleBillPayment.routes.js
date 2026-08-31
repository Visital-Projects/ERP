const express = require("express");
const router = express.Router();

const controller = require("../controllers/saleBillPayment.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");

router.post(
  "/",
  auth,
  authorize("create sale bill"),
  controller.createPayment
);

router.get(
  "/bill/:sale_bill_id",
  auth,
  authorize("manage sale bill"),
  controller.getPaymentsBySaleBill
);

router.get(
  "/:id",
  auth,
  authorize("manage sale bill"),
  controller.getPaymentById
);

router.patch(
  "/:id",
  auth,
  authorize("edit sale bill"),
  controller.updatePayment
);

router.delete(
  "/:id",
  auth,
  authorize("delete sale bill"),
  controller.deletePayment
);

module.exports = router;