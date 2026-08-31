const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Employee = require('./employee.model');
const LeaveType = require('./leave_type.model');

const Leave = sequelize.define('Leave', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  leave_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  applied_on: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_leave_days: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  leave_reason: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  remark: {
    type: DataTypes.STRING(191),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: 'Pending'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
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
  tableName: 'leaves',
  timestamps: false
});

Leave.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Leave.belongsTo(LeaveType, { foreignKey: 'leave_type_id', as: 'leave_type' });

module.exports = Leave;
