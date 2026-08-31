

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Category = require('./category.model');
const Unit = require('./unit.model');
const Tax = require('./tax.model');
const ChartOfAccount = require('./chart_of_account.model');

// Product model
const Product = sequelize.define('Product', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(191), allowNull: false },
  sku: { type: DataTypes.STRING(191), allowNull: true },
  sale_price: { type: DataTypes.DOUBLE, allowNull: true, defaultValue: 0 },
  purchase_price: { type: DataTypes.DOUBLE, allowNull: true, defaultValue: 0 },
  quantity: { type: DataTypes.DOUBLE, allowNull: true, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true },
  pro_image: { type: DataTypes.STRING(191), allowNull: true },
  type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'product' }, // 'product' | 'service'
  sale_chartaccount_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  expense_chartaccount_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  tax_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  category_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  unit_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }, // soft delete
}, {
  tableName: 'product_services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true, // ✅ enable soft delete
});

// Associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
Product.belongsTo(Tax, { foreignKey: 'tax_id', as: 'tax' });
Product.belongsTo(ChartOfAccount, { foreignKey: 'sale_chartaccount_id', as: 'saleAccount' });
Product.belongsTo(ChartOfAccount, { foreignKey: 'expense_chartaccount_id', as: 'expenseAccount' });

module.exports = Product;
