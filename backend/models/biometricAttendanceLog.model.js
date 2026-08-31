const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database"); // ✅ THIS WAS MISSING

const BiometricAttendanceLog = sequelize.define(
  "BiometricAttendanceLog",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    employee_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    log_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

        log_time: {
  type: DataTypes.STRING(8),   // instead of TIME
  allowNull: true,
},

    device_sn: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    source: {
      type: DataTypes.STRING(50),
      defaultValue: "biometric",
    },

    processed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "biometric_attendance_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = BiometricAttendanceLog;
