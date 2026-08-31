const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const ChartOfAccountType = require('./chart_of_account_type.model');
const ChartOfAccount = require('./chart_of_account.model');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(191), allowNull: false },
  type: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }, // FK → chart_of_account_type
  chart_account_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }, // FK → chart_of_account
  color: { type: DataTypes.STRING(191), allowNull: false, defaultValue: '#fc544b' },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'product_service_categories',
  timestamps: false,
});

// Associations
Category.belongsTo(ChartOfAccountType, { foreignKey: 'type', as: 'accountType' });
Category.belongsTo(ChartOfAccount, { foreignKey: 'chart_account_id', as: 'chartAccount' });

module.exports = Category;
