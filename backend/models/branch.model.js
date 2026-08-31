

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = sequelize.define('Branch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  //-------------------
  // 🆕 NEW FIELDS
  branch_address: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },

  contact_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: null,
  },
  
  // 🆕 NEW FIELD: clock_out
  clock_out: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Clock out functionality enabled/disabled for branch',
  },

  co_ordinates: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
    comment: 'Latitude,Longitude (optional)',
  },
  // -------------------
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,  
  },
  
     // 🆕 Working days per month (26 / 30)
  working_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 26,
    comment: 'Monthly working days (26 or 30)',
  },

  // 🆕 Working hours per day
  working_hours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 8,
    comment: 'Daily working hours',
  },

}, {
  tableName: 'branches',
  timestamps: true,  
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  paranoid: true,            
  deletedAt: 'deleted_at',   


});
module.exports = Branch;
