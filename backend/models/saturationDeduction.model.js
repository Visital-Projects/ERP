const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Employee = require('./employee.model');
const DeductionOption = require('./deductionOption.model')

const SaturationDeduction = sequelize.define('SaturationDeduction', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'employee_id'
    },
    onDelete: 'CASCADE'
  },
  deduction_option: {
    type: DataTypes.ENUM('Tax', 'Insurance', 'Pension', 'Other'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type:{
      type: DataTypes.STRING,
      allowNull: false
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
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'saturation_deductions',
  timestamps: false,
  paranoid: true,             
  deletedAt: 'deleted_at',     

});

SaturationDeduction.belongsTo(Employee, {
  foreignKey: 'employee_id',
  targetKey: 'employee_id',
  as: 'employee'
});


SaturationDeduction.belongsTo(DeductionOption, {
  foreignKey: 'deduction_option',   // field in SaturationDeduction table
  as: 'deductionOption'             // use this alias consistently
});


module.exports = SaturationDeduction;


