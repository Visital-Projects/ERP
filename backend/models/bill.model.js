// models/bill.model.js

const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database"); // adjust path to your sequelize instance
const Vender = require("./vender.model");
const Category = require("./category.model");


const Bill = sequelize.define(
  "Bill",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    bill_id: {
      type: DataTypes.STRING(191),
      allowNull: false,
      defaultValue: "0",
    },
    vender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bill_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    order_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    user_type: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    shipping_display: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    send_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    discount_apply: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "bills",
    timestamps: false,
  }
);

// ===============================
// Associations
// ===============================
Bill.belongsTo(Vender, { foreignKey: "vender_id", as: "vender" });
Vender.hasMany(Bill, { foreignKey: "vender_id", as: "bills" });

Bill.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Bill, { foreignKey: "category_id", as: "bills" });

module.exports = Bill;
