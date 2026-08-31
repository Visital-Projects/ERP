const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  complaint_from: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  complaint_against: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  complaint_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(191),
    allowNull: true
  },
  created_by: {
    type: DataTypes.STRING(191),
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
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
   }
  },
{
  tableName: 'complaints',
  timestamps: false
});

module.exports = Complaint;
