const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');
const invoiceController = require("../controllers/invoice_wo_po.controller");

// Unified invoice creation for PO/WO

router.post("/", auth, invoiceController.raiseInvoice);
router.get("/", auth,invoiceController. getInvoices);           // List all or filtered
router.get("/:id", auth,invoiceController. getInvoiceById);    // Get single
router.put("/:id", auth, invoiceController.updateInvoice);     // Update invoice
router.delete("/:id", auth, invoiceController.deleteInvoice); 
router.get("/workorder/:wo_number", auth,invoiceController.getWorkOrderInvoiceDetails);
router.get("/purchaseorder/:po_number", auth, invoiceController.getPurchaseOrderInvoiceDetails);




module.exports = router;
