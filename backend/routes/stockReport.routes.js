const express = require('express');
const router = express.Router();
const stockReportController = require('../controllers/stockReport.controller');
const auth = require('../middlewares/auth.middleware');

// Create
router.post('/', auth,stockReportController.createStockReport);

// Read All
router.get('/', auth,stockReportController.getStockReports);

// Read One
router.get('/:id', auth,stockReportController.getStockReportById);

// Update
router.put('/:id', auth,stockReportController.updateStockReport);

// Delete
router.delete('/:id', auth,stockReportController.deleteStockReport);

module.exports = router;
