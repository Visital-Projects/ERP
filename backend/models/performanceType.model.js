


const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const PerformanceType = sequelize.define('PerformanceType', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true

  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'performance_types',
  timestamps: false
});

module.exports = PerformanceType;
