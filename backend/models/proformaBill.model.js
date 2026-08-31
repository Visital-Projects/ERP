const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Branch = require('./branch.model');

const ProformaBill = sequelize.define('ProformaBill', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },

  // =========================
  // E-INVOICE FIELDS
  // =========================
  irn: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ack_no: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ack_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // =========================
  // CONSIGNEE (SHIP TO)
  // =========================
  consignee_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consignee_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  consignee_gstin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consignee_state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consignee_state_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // =========================
  // BUYER (BILL TO)
  // =========================
  buyer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  buyer_gstin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_state_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // =========================
  // INVOICE DETAILS
  // =========================
  invoice_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  invoice_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  delivery_note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_terms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reference_no: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  other_references: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_order_no: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_order_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dispatch_doc_no: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  delivery_note_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dispatched_through: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  terms_of_delivery: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // =========================
  // COMPANY DETAILS
  // =========================
  company_pan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid'),
    allowNull: false,
    defaultValue: 'pending',
  },

  advance_amount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  total_amount: {
  type: DataTypes.FLOAT,
  allowNull: true,
  defaultValue: 0,
},

outstanding_amount: {
  type: DataTypes.FLOAT,
  allowNull: true,
  defaultValue: 0,
},

  // =========================
  // BANK DETAILS
  // =========================
  bank_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  account_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ifsc_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bank_branch: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // =========================
  // DOCUMENT UPLOAD
  // =========================
  document: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  // =========================
  // ASSIGNMENT (BRANCH)
  // =========================
  assigned_to: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },

  // =========================
  // CREATED BY
  // =========================
  created_by: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },

}, {
  tableName: 'proforma_bills',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

// =========================
// ASSOCIATIONS
// =========================
ProformaBill.belongsTo(Branch, {
  foreignKey: 'assigned_to',
  as: 'assignedBranch',
});

module.exports = ProformaBill;