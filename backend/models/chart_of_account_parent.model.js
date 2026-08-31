const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const ChartOfAccountParent = sequelize.define('ChartOfAccountParent', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(191), allowNull: false },
  sub_type: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  type: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  account: { type: DataTypes.STRING(191), allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'chart_of_account_parents',
  timestamps: false,
});

module.exports = ChartOfAccountParent;
