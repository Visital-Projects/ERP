const express = require('express');
const router = express.Router();

const proformaBillController = require('../controllers/proformaBill.controller');

const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload.middleware');

// =========================
// ROUTES
// =========================

// Create Proforma Bill
router.post(
  '/',
  auth,
  authorize('create proforma bill'),
  upload.array("documents", 10),
  proformaBillController.createProformaBill
);

// Get All Proforma Bills
router.get(
  '/',
  auth,
  authorize('manage proforma bill'),
  proformaBillController.getAllProformaBills
);

// Get Proforma Bill By ID
router.get(
  '/:id',
  auth,
  authorize('manage proforma bill'),
  proformaBillController.getProformaBillById
);

// Update Proforma Bill
router.patch(
  '/:id',
  auth,
  authorize('edit proforma bill'),
  upload.array("documents", 10),
  proformaBillController.updateProformaBill
);

// Delete Proforma Bill (Soft Delete)
router.delete(
  '/:id',
  auth,
  authorize('delete proforma bill'),
  proformaBillController.deleteProformaBill
);

module.exports = router;