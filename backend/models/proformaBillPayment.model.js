const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const ProformaBill = require("./proformaBill.model");

const ProformaBillPayment = sequelize.define(
  "ProformaBillPayment",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    proforma_bill_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "proforma_bills",
        key: "id",
      },
    },

    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    amount_received: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },

    tds: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },

    deductions: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },

    payment_mode: {
      type: DataTypes.ENUM(
        "cash",
        "bank",
        "upi",
        "cheque",
        "neft"
      ),
      allowNull: false,
    },

    reference_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "proforma_bill_payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// =========================
// ASSOCIATIONS
// =========================
ProformaBill.hasMany(ProformaBillPayment, {
  foreignKey: "proforma_bill_id",
  as: "payments",
});

ProformaBillPayment.belongsTo(ProformaBill, {
  foreignKey: "proforma_bill_id",
  as: "proformaBill",
});

module.exports = ProformaBillPayment;