const express = require('express');
const router = express.Router();

const saleBillController = require('../controllers/saleBill.controller');

const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload.middleware');

// =========================
// ROUTES
// =========================

// Create Sale Bill
router.post(
  '/',
  auth,
  authorize('create sale bill'),
  upload.array("documents", 10),
  saleBillController.createSaleBill
);

// Get All Sale Bills
router.get(
  '/',
  auth,
  authorize('manage sale bill'),
  saleBillController.getAllSaleBills
);

// Get Sale Bill By ID
router.get(
  '/:id',
  auth,
  authorize('manage sale bill'),
  saleBillController.getSaleBillById
);

// Update Sale Bill
router.patch(
  '/:id',
  auth,
  authorize('edit sale bill'),
  upload.array("documents", 10),
  saleBillController.updateSaleBill
);

// Delete Sale Bill (Soft Delete)
router.delete(
  '/:id',
  auth,
  authorize('delete sale bill'),
  saleBillController.deleteSaleBill
);

module.exports = router;