


const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Employee = require('./employee.model');
const User = require('./user.model');

const EmployeeSalary = sequelize.define('EmployeeSalary', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  salary_type: {
    type: DataTypes.ENUM('monthly', 'hourly'),
    defaultValue: 'monthly'
  },
  basic_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  allowance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  deduction: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  effective_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  created_by: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
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
  tableName: 'employee_salaries',
  timestamps: false
});

// Associations
EmployeeSalary.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

EmployeeSalary.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

module.exports = EmployeeSalary;
