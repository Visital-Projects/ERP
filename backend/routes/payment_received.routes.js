// routes/payment_received.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment_received.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require('../middlewares/authorize');

router.post("/", auth,authorize('create payment received'), controller.create);
router.get("/", auth,authorize('manage payment received'), controller.getAll);
router.get("/:id", auth,authorize('manage payment received'), controller.getById);
router.put("/:id", auth,authorize('edit payment received'), controller.update);
router.patch("/:id", auth,authorize('edit payment received'), controller.update);
router.delete("/:id", auth,authorize('delete payment received'), controller.remove);
router.get("/history/:base_amount_id", controller.getPaymentHistory);

module.exports = router;
