const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const ExpenseItem = sequelize.define("ExpenseItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  is_gst_applicable: { type: DataTypes.BOOLEAN, defaultValue: false },
  gst_rate: { type: DataTypes.DECIMAL(5,2), defaultValue: 0.00 },
  gst_amount: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  line_total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  document_url: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: "expense_items",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = ExpenseItem;
