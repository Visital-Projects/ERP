const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const LeaveType = sequelize.define('LeaveType', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  days: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted_at: {               // ✅ Add soft delete column
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: 'leave_types',
  timestamps: true,            // ✅ enable Sequelize timestamps
  createdAt: 'created_at',     // ✅ map createdAt to created_at
  updatedAt: 'updated_at',     // ✅ map updatedAt to updated_at
  deletedAt: 'deleted_at',     // ✅ map soft delete column
  paranoid: true,              // ✅ enable soft delete
  underscored: true            // ✅ use snake_case

});

module.exports = LeaveType;

//   tableName: 'leave_types',
//   timestamps: false