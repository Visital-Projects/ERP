const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const ProformaBill = require("./proformaBill.model");

const ProformaBillService = sequelize.define("proforma_bill_service", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },

  proforma_bill_id: {
  type: DataTypes.BIGINT.UNSIGNED, // ✅ must match parent
  allowNull: false,
  references: { model: "proforma_bills", key: "id" },
  onDelete: "CASCADE",
},

  // =========================
  // SERVICE DETAILS
  // =========================
  service_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  hsn_sac: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  unit: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  // =========================
  // TAX DETAILS
  // =========================
  is_taxable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  taxable_value: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  cgst: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },

  sgst: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },

  igst: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },

  tax_rate: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  tax_amount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  // =========================
  // FINAL AMOUNTS
  // =========================
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  total_amount_words: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  tax_amount_words: {
    type: DataTypes.STRING,
    allowNull: true,
  },

}, {
  tableName: 'proforma_bill_services',
  timestamps: false
});

// =========================
// ASSOCIATIONS
// =========================
ProformaBill.hasMany(ProformaBillService, {
  foreignKey: "proforma_bill_id",
  as: "services",
});

ProformaBillService.belongsTo(ProformaBill, {
  foreignKey: "proforma_bill_id",
  as: "proformaBill",
});

module.exports = ProformaBillService;