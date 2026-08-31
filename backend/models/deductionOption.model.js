const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const DeductionOption = sequelize.define('DeductionOption', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
primaryKey: true,
autoIncrement: true,
},
name: {
type: DataTypes.STRING(191),
allowNull: false,
},
created_by: {
type: DataTypes.INTEGER,
allowNull: false,
},
created_at: {
type: DataTypes.DATE,
allowNull: true,
},
updated_at: {
type: DataTypes.DATE,
allowNull: true,
},
deleted_at: {                     // 🔹 ADDED
    type: DataTypes.DATE,
    allowNull: true,
  }

}, {
// tableName: 'deduction_options',
// timestamps: true,
// createdAt: 'created_at',
// updatedAt: 'updated_at',
  tableName: 'deduction_options',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,                  // 🔹 ENABLE SOFT DELETE
  deletedAt: 'deleted_at',         // 🔹 USE deleted_at COLUMN

});

module.exports = DeductionOption;
