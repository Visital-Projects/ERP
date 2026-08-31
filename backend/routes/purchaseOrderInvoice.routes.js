const express = require('express');
const router = express.Router();
const purchaseOrderInvoiceController = require('../controllers/purchase_order_invoice.controller');
const auth = require('../middlewares/auth.middleware'); // assuming you have auth
const authorize = require("../middlewares/authorize");

router.post('/', auth,authorize('create purchase order invoice'), purchaseOrderInvoiceController.addPayment);
router.get('/', auth,authorize('manage purchase order invoice'), purchaseOrderInvoiceController.getAllPayments);
router.get('/:id', auth,authorize('manage purchase order invoice'), purchaseOrderInvoiceController.getPaymentById);
router.patch('/:id', auth,authorize('edit purchase order invoice'), purchaseOrderInvoiceController.updatePayment);
router.delete('/:id', auth,authorize('delete purchase order invoice'), purchaseOrderInvoiceController.deletePayment);
router.get('/summary/:po_number', auth,authorize('manage purchase order invoice'), purchaseOrderInvoiceController.getPaymentSummary);
module.exports = router;
