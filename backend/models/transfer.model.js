
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Employee = require('./employee.model');
const Branch = require('./branch.model');
const Department = require('./department.model');
const Designation = require('./designation.model'); // 🟢 ADD DESIGNATION IMPORT


const Transfer = sequelize.define('Transfer', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  designation_id: { // 🟢 ADDED DESIGNATION FIELD
    type: DataTypes.INTEGER,
    allowNull: true
  },
  transfer_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'transfers',
  timestamps: true,           // ✅ enable automatic created_at / updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,             // ✅ enable soft delete
  deletedAt: 'deleted_at'     // ✅ column for soft delete
});

// Associations
Transfer.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Transfer.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Transfer.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Transfer.belongsTo(Designation, { foreignKey: 'designation_id', as: 'designation' }); // 🟢 ADD DESIGNATION ASSOCIATION


module.exports = Transfer;
