
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Trainer = sequelize.define('Trainer', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  branch: DataTypes.STRING,
  firstname: DataTypes.STRING,
  lastname: DataTypes.STRING,
  contact: DataTypes.STRING,
  email: DataTypes.STRING,
  address: DataTypes.TEXT,
  expertise: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'trainers',
  timestamps: false
});

module.exports = Trainer;

