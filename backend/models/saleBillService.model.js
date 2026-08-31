const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const SaleBill = require("./saleBill.model");

const SaleBillService = sequelize.define("sale_bill_service", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },

  sale_bill_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: { model: "sale_bills", key: "id" },
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
  tableName: 'sale_bill_services',
  timestamps: false
});

// =========================
// ASSOCIATIONS
// =========================
SaleBill.hasMany(SaleBillService, {
  foreignKey: "sale_bill_id",
  as: "services",
});

SaleBillService.belongsTo(SaleBill, {
  foreignKey: "sale_bill_id",
  as: "saleBill",
});

module.exports = SaleBillService;