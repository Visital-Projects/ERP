const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database'); // adjust path if needed

const ManpowerSalary = sequelize.define('ManpowerSalary', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  job_mode_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  plant_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  manpower_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Unknown',
  },
  month: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  total_salary: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false,
    defaultValue: 0.00,
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
  }
}, {
  tableName: 'manpower_salary',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ManpowerSalary;
