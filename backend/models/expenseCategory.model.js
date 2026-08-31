// models/expenseCategory.model.js
const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const ExpenseCategory = sequelize.define(
  "ExpenseCategory",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false }, // user who created it
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "expense_categories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    defaultScope: { where: { is_deleted: false } },
  }
);

module.exports = ExpenseCategory;
