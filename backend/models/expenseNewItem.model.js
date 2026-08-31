// models/expenseNewItem.model.js
const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const ExpenseNew = require("./expenseNew.model"); // circular require ok if models imported after definition

const ExpenseNewItem = sequelize.define(
  "ExpenseNewItem",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    expense_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: ExpenseNew, key: "id" } },
    item_name: { type: DataTypes.STRING(255), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },      // amount without tax
    is_taxable: { type: DataTypes.BOOLEAN, defaultValue: false },
    tax_rate: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
    tax_type: { type: DataTypes.ENUM("inclusive", "exclusive"), allowNull: true },
    tax_total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },  // subtotal + tax (or inclusive total)
    document: { type: DataTypes.STRING(255), allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "expense_new_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

ExpenseNewItem.associate = function(models) {
  ExpenseNewItem.belongsTo(models.ExpenseNew, { foreignKey: "expense_id", as: "expense" });
};

module.exports = ExpenseNewItem;
