const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Meeting = require('./meeting.model');
const Employee = require('./employee.model');

const MeetingEmployee = sequelize.define('MeetingEmployee', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  meeting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'meeting_employees',
  timestamps: false,
});

// Associations
MeetingEmployee.belongsTo(Meeting, {
  foreignKey: 'meeting_id',
  as: 'meeting'
});

MeetingEmployee.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

module.exports = MeetingEmployee;
