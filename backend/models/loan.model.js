const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Employee = require('./employee.model');

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  loan_option: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  type:{
      type: DataTypes.STRING,
      allowNull: false
      
  },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null
        },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null
    },

  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }

}, {
  tableName: 'loans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true, 
  deletedAt: 'deleted_at'

});


Loan.belongsTo(Employee, {
  foreignKey: 'employee_id',
  targetKey: 'employee_id',
  as: 'employee'
});

module.exports = Loan;

