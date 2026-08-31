

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Employee = require('./employee.model');

const Commission = sequelize.define('Commission', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
      type: DataTypes.STRING,
      allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
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
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: 'commissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true, 
  deletedAt: 'deleted_at'


});

Commission.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

module.exports = Commission;
