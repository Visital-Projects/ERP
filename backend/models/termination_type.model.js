const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const TerminationType = sequelize.define('TerminationType', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: true,
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
  deleted_at: {                 // 🔹 ADDED
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
//   tableName: 'termination_types',
//   timestamps: false,
  tableName: 'termination_types',
  timestamps: true,             // 🔹 Enable timestamps
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,               // 🔹 Enables soft delete
  deletedAt: 'deleted_at',

});

module.exports = TerminationType;
