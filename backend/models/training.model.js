
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Training = sequelize.define('Training', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  branch: DataTypes.INTEGER,
  trainer_option: DataTypes.INTEGER,
  training_type: DataTypes.INTEGER,
  trainer: DataTypes.INTEGER,
  training_cost: DataTypes.DOUBLE,
  employee: DataTypes.INTEGER,
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  description: DataTypes.TEXT,
  performance: DataTypes.INTEGER,
  status: DataTypes.INTEGER,
  remarks: DataTypes.TEXT,
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

  
}, {
    tableName: 'trainings',
//   timestamps: false
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'

});

module.exports = Training;



//   created_by: DataTypes.INTEGER,
//   created_at: DataTypes.DATE,
//   updated_at: DataTypes.DATE