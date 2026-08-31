const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const Tax = sequelize.define(
  "Tax",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING(191), 
      allowNull: false 
    },
    // rate: { 
    //   type: DataTypes.DECIMAL(10, 2), 
    //   allowNull: false 
    // },
    rate: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_by: { type: DataTypes.INTEGER, 
      allowNull: true 
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "taxes",
    timestamps: false,
  }
);

module.exports = Tax;
