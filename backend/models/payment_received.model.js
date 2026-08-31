// models/payment_received.model.js
const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const PlantName = require("./plant_name.model");
const BaseAmount = require("./base_amount.model");

const PaymentReceived = sequelize.define(
  "PaymentReceived",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    plant_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    base_amount_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    payment_received: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    due_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payment_received",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    freezeTableName: true,
  }
);

// Associations
PaymentReceived.belongsTo(PlantName, {
  foreignKey: "plant_id",
  as: "plant",
});
PaymentReceived.belongsTo(BaseAmount, {
  foreignKey: "base_amount_id",
  as: "base_amount",
});

module.exports = PaymentReceived;


