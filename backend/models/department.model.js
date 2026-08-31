


const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = require('./branch.model'); // ✅ declare only once

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted_at: { type: DataTypes.DATE, allowNull: true } // ✅ must exist

}, 

{
tableName: 'departments',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
deletedAt: 'deleted_at',  
paranoid: true,            
underscored: true
});

// ✅ Explicit alias added
Department.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });



module.exports = Department;






// Department.belongsTo(Branch, { foreignKey: 'branch_id' });