const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Employee = require('./employee.model');


const Award = sequelize.define('Award', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  award_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gift: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'awards',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,             
  deletedAt: 'deleted_at'     
});

Award.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Employee.hasMany(Award, { foreignKey: 'employee_id', as: 'awards' });


module.exports = Award;

// Award.belongsTo(Employee, { foreignKey: 'employee_id' });
// Employee.hasMany(Award, { foreignKey: 'employee_id' });