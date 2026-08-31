const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const AwardType = sequelize.define('AwardType', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
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
  deleted_at: {                // 🔹 ADDED
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'award_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,              // 🔹 ENABLE SOFT DELETE
  deletedAt: 'deleted_at',     // 🔹 USE deleted_at COLUMN

});

module.exports = AwardType;
