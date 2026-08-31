// models/bank_account.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const ChartOfAccount = require('./chart_of_account.model');

const BankAccount = sequelize.define('BankAccount', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  holder_name: { type: DataTypes.STRING(191), allowNull: false },
  bank_name: { type: DataTypes.STRING(191), allowNull: false },
  account_number: { type: DataTypes.STRING(50), allowNull: false },
  chart_account_id: { 
    type: DataTypes.BIGINT.UNSIGNED, 
    allowNull: false,
    references: { model: ChartOfAccount, key: 'id' }
  },
  opening_balance: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
  contact_number: { type: DataTypes.STRING(20), allowNull: true },
  bank_address: { type: DataTypes.TEXT, allowNull: true },
  payment_name: { 
    type: DataTypes.ENUM('bank transfer'), 
    allowNull: false,
    defaultValue: 'bank transfer'
  },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'bank_accounts',
  timestamps: false,
   paranoid: true,
  deletedAt: 'deleted_at'
});

// Association
BankAccount.belongsTo(ChartOfAccount, { foreignKey: 'chart_account_id', as: 'chartAccount' });

module.exports = BankAccount;
