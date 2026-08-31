
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const AllowanceOption = sequelize.define('AllowanceOption', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true
},
name: {
type: DataTypes.STRING(191),
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
deleted_at: {   // 🔹 NEW soft delete column
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }

}, {
// tableName: 'allowance_options',
// timestamps: true,
// deletedAt: 'deleted_at', // 🔹 map Sequelize’s paranoid delete
// paranoid: true           // 🔹 ensures destroy() = soft delete

tableName: 'allowance_options',
  timestamps: true,        // 🔹 enable timestamps
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at', // 🔹 map Sequelize’s paranoid delete
  paranoid: true           // 🔹 ensures destroy() = soft delete


});

module.exports = AllowanceOption;