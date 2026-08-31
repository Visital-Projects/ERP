// models/shift.model.js
const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const Shift = sequelize.define(
  "Shift",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    break_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    grace_period: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      comment: "Grace period in minutes for late punch",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "shifts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Shift;
