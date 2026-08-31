
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/work_order_invoice.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');
// Add payment
router.post('/',auth,authorize('create work order invoice'), invoiceController.addPayment);

// Get all payments
router.get('/',auth,authorize('manage work order invoice'), invoiceController.getAllPayments);

// Get payment by ID
router.get('/:id',auth,authorize('manage work order invoice'), invoiceController.getPaymentById);

// Get payment summary for a work order
router.get('/summary/:wo_number',auth,authorize('manage work order invoice'), invoiceController.getPaymentSummary);

// Update payment
router.put('/:id',auth,authorize('edit work order invoice'), invoiceController.updatePayment);

// Delete payment
router.delete('/:id',auth,authorize('delete work order invoice'), invoiceController.deletePayment);

module.exports = router;
