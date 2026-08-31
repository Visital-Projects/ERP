const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = require('./branch.model');

const BranchWallet = sequelize.define('BranchWallet', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  branch_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: Branch,
      key: 'id',
    },
  },
   name: {            // ✅ Add this field
    type: DataTypes.STRING(191),
    allowNull: true
  },
  transaction_type: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false,
  },
  transaction_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  balance_after: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  created_by: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'branch_wallets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

BranchWallet.belongsTo(Branch, { foreignKey: 'branch_id' });

module.exports = BranchWallet;
