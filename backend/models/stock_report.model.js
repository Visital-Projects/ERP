const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Product = require('./product.model');

const StockReport = sequelize.define('StockReport', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  type: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'stock_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});
Product.hasMany(StockReport, {
  foreignKey: 'product_id',
  as: 'stockReports',
});

module.exports = StockReport;
