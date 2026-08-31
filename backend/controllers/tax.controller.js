const Tax = require('../models/tax.model');
const { Op, fn, col, where } = require('sequelize');
const sequelizeInstance = require('../config/database'); // only used if needed for advanced queries

// Optional related models (attempt require; if missing, skip checks)
let ProposalProduct = null;
let BillProduct = null;
let InvoiceProduct = null;
let ProductService = null;

try { ProposalProduct = require('../models/proposal_product.model'); } catch (e) { ProposalProduct = null; }
try { BillProduct = require('../models/bill_product.model'); } catch (e) { BillProduct = null; }
try { InvoiceProduct = require('../models/invoice_product.model'); } catch (e) { InvoiceProduct = null; }
try { ProductService = require('../models/product_service.model'); } catch (e) { ProductService = null; }

exports.index = async (req, res) => {
  try {
    const userId = req.user?.id || null; // require auth middleware for proper user
    const where = {};
    if (userId) where.created_by = userId;

    const taxes = await Tax.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ success: true, data: taxes });
  } catch (err) {
    console.error('Tax index error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

exports.store = async (req, res) => {
  try {
    const { name, rate } = req.body;
    const created_by = req.user?.id || null;

    // Basic validation
    if (!name || String(name).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (name.length > 191) {
      return res.status(400).json({ success: false, message: 'Name too long (max 191 characters)' });
    }
    if (rate === undefined || rate === null || rate === '') {
      return res.status(400).json({ success: false, message: 'Rate is required' });
    }
    const numericRate = Number(rate);
    if (Number.isNaN(numericRate)) {
      return res.status(400).json({ success: false, message: 'Rate must be a number' });
    }

    const tax = await Tax.create({
      name: name.trim(),
      rate: numericRate,
      created_by,
      created_at: new Date(),
      updated_at: new Date()
    });

    return res.status(201).json({ success: true, message: 'Tax rate successfully created.', data: tax });
  } catch (err) {
    console.error('Tax store error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

exports.show = async (req, res) => {
  try {
    const tax = await Tax.findByPk(req.params.id);
    if (!tax) return res.status(404).json({ success: false, message: 'Tax not found' });
    return res.status(200).json({ success: true, data: tax });
  } catch (err) {
    console.error('Tax show error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const tax = await Tax.findByPk(req.params.id);
    if (!tax) return res.status(404).json({ success: false, message: 'Tax not found' });

    // Only allow owner to update (mimics creatorId check)
    const requesterId = req.user?.id;
    if (tax.created_by && requesterId && Number(tax.created_by) !== Number(requesterId)) {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    const { name, rate } = req.body;

    if (name !== undefined) {
      if (!String(name).trim().length) return res.status(400).json({ success: false, message: 'Name is required' });
      if (name.length > 191) return res.status(400).json({ success: false, message: 'Name too long (max 191)' });
      tax.name = name.trim();
    }

    if (rate !== undefined) {
      const numericRate = Number(rate);
      if (Number.isNaN(numericRate)) {
        return res.status(400).json({ success: false, message: 'Rate must be a number' });
      }
      tax.rate = numericRate;
    }

    tax.updated_at = new Date();
    await tax.save();

    return res.status(200).json({ success: true, message: 'Tax rate successfully updated.', data: tax });
  } catch (err) {
    console.error('Tax update error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const tax = await Tax.findByPk(req.params.id);
    if (!tax) return res.status(404).json({ success: false, message: 'Tax not found' });

    const requesterId = req.user?.id;
    if (tax.created_by && requesterId && Number(tax.created_by) !== Number(requesterId)) {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    // Check related tables for references
    // Laravel checks: ProposalProduct (tax column), BillProduct (tax), InvoiceProduct (tax), ProductService (tax_id)
    const checks = [
      { Model: ProposalProduct, column: 'tax' },
      { Model: BillProduct, column: 'tax' },
      { Model: InvoiceProduct, column: 'tax' },
      { Model: ProductService, column: 'tax_id' },
    ];

    for (const chk of checks) {
      const { Model, column } = chk;
      if (!Model) continue; // model not present in project - skip

      // Try to find a row where tax id is stored:
      // 1) if column equals tax id (single id)
      // 2) or column has comma-separated list (FIND_IN_SET)
      const found = await Model.findOne({
        where: {
          [Op.or]: [
            { [column]: tax.id },
            where(fn('FIND_IN_SET', String(tax.id), col(column)), { [Op.gt]: 0 })
          ]
        }
      });
      if (found) {
        return res.status(400).json({
          success: false,
          message:
            'This tax is already assigned to proposal or bill or invoice or product & service. Move or remove related data before deleting.'
        });
      }
    }

    await tax.destroy();
    return res.status(200).json({ success: true, message: 'Tax rate successfully deleted.' });
  } catch (err) {
    console.error('Tax destroy error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};
