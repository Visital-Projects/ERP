// models/chart_of_account_type.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const ChartOfAccountType = sequelize.define('ChartOfAccountType', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(191), allowNull: true, defaultValue: null },
  created_by: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
}, {
  tableName: 'chart_of_account_types',
  timestamps: false, // using created_at / updated_at columns explicitly
});

module.exports = ChartOfAccountType;
