const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  branch_id: DataTypes.INTEGER,
  department_id: DataTypes.TEXT, // stored as comma-separated text
  employee_id: DataTypes.TEXT,   // stored as comma-separated text
  title: DataTypes.STRING,
  start_date: DataTypes.DATEONLY,
  end_date: DataTypes.DATEONLY,
  color: DataTypes.STRING,
  description: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'events',
  timestamps: false
});

module.exports = Event;

