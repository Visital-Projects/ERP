const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const ProductLog = sequelize.define('ProductLog', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  action: { type: DataTypes.STRING(50), allowNull: false }, // created | updated | deleted
  old_data: { type: DataTypes.JSON, allowNull: true },
  new_data: { type: DataTypes.JSON, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'product_logs',
  timestamps: false,
});

module.exports = ProductLog;
