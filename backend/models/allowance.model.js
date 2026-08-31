

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Employee = require('./employee.model');

const Allowance = sequelize.define('Allowance', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  allowance_option: {
    type: DataTypes.STRING,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
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
  tableName: 'allowances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  paranoid: true, 
  deletedAt: 'deleted_at',

});

Allowance.belongsTo(Employee, { foreignKey: 'employee_id', targetKey: 'employee_id', as: 'employee' });

module.exports = Allowance;
