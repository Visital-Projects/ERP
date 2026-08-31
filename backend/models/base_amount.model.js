const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const JobMode = require('./job_mode.model');
const Branch = require('./branch.model');   // ✅ use Branch instead of PlantName
const ContractPeriod = require('./contract_period.model');

const BaseAmount = sequelize.define(
  'BaseAmount',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    job_mode_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    branch_id: {   // ✅ replaced plant_id with branch_id
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    po_wo_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    base_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },

    // --- TAX CONFIG (rates) ---
    cgst_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    sgst_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    igst_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    calculation_type: {
      type: DataTypes.ENUM('inclusive', 'exclusive'),
      allowNull: false,
      defaultValue: 'exclusive'
    },

    // --- COMPUTED TAX AMOUNTS ---
    taxable_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    cgst_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    sgst_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    igst_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_tax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    grand_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },

    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'base_amount',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true
  }
);

// Associations
BaseAmount.belongsTo(JobMode, { foreignKey: 'job_mode_id', as: 'job_mode' });
BaseAmount.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });  // ✅ updated association
BaseAmount.belongsTo(ContractPeriod, { foreignKey: 'po_wo_id', as: 'contract_period' });

module.exports = BaseAmount;
