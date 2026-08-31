const express = require("express");
const router = express.Router();
const taxController = require("../controllers/invoiceTax.controller");
const auth = require('../middlewares/auth.middleware');

router.post("/",auth, taxController.addTax);
router.get("/invoice/:invoiceId",auth, taxController.getTaxesByInvoice);

module.exports = router;
