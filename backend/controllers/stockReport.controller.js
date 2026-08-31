const StockReport = require('../models/stock_report.model');

// Create a new stock report
exports.createStockReport = async (req, res) => {
  try {
    const report = await StockReport.create(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create stock report', details: error.message });
  }
};

// Get all stock reports
exports.getStockReports = async (req, res) => {
  try {
    const reports = await StockReport.findAll();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock reports', details: error.message });
  }
};

// Get a single stock report
exports.getStockReportById = async (req, res) => {
  try {
    const report = await StockReport.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Stock report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving stock report', details: error.message });
  }
};

// Update a stock report
exports.updateStockReport = async (req, res) => {
  try {
    const report = await StockReport.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Stock report not found' });

    await report.update(req.body);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock report', details: error.message });
  }
};

// Delete a stock report
exports.deleteStockReport = async (req, res) => {
  try {
    const report = await StockReport.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Stock report not found' });

    await report.destroy();
    res.json({ message: 'Stock report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete stock report', details: error.message });
  }
};
