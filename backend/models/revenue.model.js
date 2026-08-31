const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const BankAccount = require('./bank_account.model');
const Customer = require('./customer.model');
const Category = require('./category.model');

const Revenue = sequelize.define('Revenue', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  account_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: BankAccount, key: 'id' } },
  customer_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: Customer, key: 'id' } },
  category_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: Category, key: 'id' } },
  payment_method: { type: DataTypes.STRING(50), allowNull: true }, // ✅ now VARCHAR
  reference: { type: DataTypes.STRING(191), allowNull: true },
  add_receipt: { type: DataTypes.STRING(255), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
}, {
  tableName: 'revenues_new',
  timestamps: false,
  paranoid: true,
  deletedAt: 'deleted_at'
});

// Associations
Revenue.belongsTo(BankAccount, { foreignKey: 'account_id', as: 'account' });
Revenue.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Revenue.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = Revenue;
