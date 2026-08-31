const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SaleBillPayment = sequelize.define(
  "SaleBillPayment",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    sale_bill_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "sale_bills",
        key: "id",
      },
      onDelete: "CASCADE",
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
        "neft",
        "adjustment"
      ),
      allowNull: false,
    },

    // 🔥 NEW (IMPORTANT)
    source_type: {
      type: DataTypes.ENUM("manual", "proforma"),
      allowNull: false,
      defaultValue: "manual",
    },

    source_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
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
    tableName: "sale_bill_payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["sale_bill_id"],
      },
    ],
  }
);

// 🔥 ASSOCIATION (LAZY REQUIRE)
SaleBillPayment.associate = (models) => {
  SaleBillPayment.belongsTo(models.SaleBill, {
    foreignKey: "sale_bill_id",
    as: "saleBill",
  });
};

module.exports = SaleBillPayment;