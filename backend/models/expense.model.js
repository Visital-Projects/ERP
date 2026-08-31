const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Branch = require("./branch.model");
const User = require("./user.model");
const ExpenseItem = require("./expenseItem.model");

const Expense = sequelize.define("Expense", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  branch_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Branch, key: "id" } },
  payment_date: { type: DataTypes.DATEONLY, allowNull: false },
//   branch_wallet_id: { type: DataTypes.INTEGER, allowNull: true },
  subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  tax_total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  total_amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  payments_status: { type: DataTypes.STRING(255), allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  description: { type: DataTypes.TEXT, allowNull: true },
  is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "expenses_new",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  defaultScope: {
    where: { is_deleted: false }  // automatically hide soft-deleted expenses
  }
});

// Associations
Expense.belongsTo(Branch, { foreignKey: "branch_id" });
Expense.belongsTo(User, { foreignKey: "created_by", as: "creator" });

Expense.hasMany(ExpenseItem, { foreignKey: "expense_id", as: "items" });
ExpenseItem.belongsTo(Expense, { foreignKey: "expense_id" });

module.exports = Expense;
