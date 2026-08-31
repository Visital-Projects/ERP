const { DataTypes } = require("sequelize");
const { dmpsDB } = require("../config/database");

const DeviceLog = dmpsDB.define(
  "DeviceLog",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    DeviceKey: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    IOTime: DataTypes.DATE,
    IOMode: DataTypes.STRING,
    VerifyMode: DataTypes.STRING,
    WorkCode: DataTypes.STRING,
    IsSync: DataTypes.INTEGER,
  },
  {
    tableName: "devicelogs",
    timestamps: false,
  }
);

module.exports = DeviceLog;