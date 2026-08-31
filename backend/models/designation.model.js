

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = require('./branch.model');
const Department = require('./department.model');

const Designation = sequelize.define('Designation', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  overtime_rate: {
    type: DataTypes.DECIMAL(5, 2),   // allows 1.00, 1.50, 2.00
    allowNull: false,
    defaultValue: 1.0,
    comment: 'Overtime multiplier (1, 1.5, 2)',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
  deleted_at: {                     // ✅ Add deleted_at column
    type: DataTypes.DATE,
    allowNull: true
  },

}, {
  tableName: 'designations',
  timestamps: true,
  deletedAt: 'deleted_at',           // ✅ map soft delete column
  paranoid: true,                    // ✅ enable soft delete
  underscored: true, 
});

Designation.belongsTo(Branch, { foreignKey: 'branch_id' });
Designation.belongsTo(Department, { foreignKey: 'department_id' });

module.exports = Designation;
