// src/models/payslip.model.js
const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const Employee = require("./employee.model");

const Payslip = sequelize.define(
  "Payslip",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    net_payble: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    gross_salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    salary_month: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("paid", "unpaid"),
      defaultValue: "unpaid",
    },
    basic_salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    allowance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    commission: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    loan: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    saturation_deduction: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    other_payment: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    overtime: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    
  },
  {
    tableName: "pay_slips",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Payslip;

