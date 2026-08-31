const express = require("express");
const router = express.Router();

const controller = require("../controllers/proformaBillPayment.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");

// =========================
// CREATE PAYMENT
// =========================
router.post(
  "/",
  auth,
  authorize("create proforma bill"),
  controller.createPayment
);

// =========================
// GET PAYMENTS BY PROFORMA
// =========================
router.get(
  "/bill/:proforma_bill_id",
  auth,
  authorize("manage proforma bill"),
  controller.getPaymentsByProforma
);

// =========================
// GET PAYMENT BY ID
// =========================
router.get(
  "/:id",
  auth,
  authorize("manage proforma bill"),
  controller.getPaymentById
);

// =========================
// UPDATE PAYMENT
// =========================
router.patch(
  "/:id",
  auth,
  authorize("edit proforma bill"),
  controller.updatePayment
);

// =========================
// DELETE PAYMENT
// =========================
router.delete(
  "/:id",
  auth,
  authorize("delete proforma bill"),
  controller.deletePayment
);

module.exports = router;