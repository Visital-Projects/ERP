
// models/plant_name.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const JobMode = require('./job_mode.model');
const Branch = require('./branch.model'); // NEW: branch model


const PlantName = sequelize.define(
  'PlantName',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    job_mode_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    branch_id: {                         // NEW column
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: false
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'plant_name',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true
  }
);

// Associations
PlantName.belongsTo(JobMode, { foreignKey: 'job_mode_id', as: 'job_mode' });
PlantName.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' }); // NEW
JobMode.hasMany(PlantName, { foreignKey: 'job_mode_id', as: 'plants' });

module.exports = PlantName;
