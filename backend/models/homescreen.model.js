// models/homescreen.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const HomeScreen = sequelize.define(
  'HomeScreen',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    logo: {
      type: DataTypes.STRING, // store file path
      allowNull: true,
    },
    homescreen_left_image: {
      type: DataTypes.STRING, // store file path
      allowNull: true,
    },
    homescreen_right_image: {
      type: DataTypes.STRING, // store file path
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'home_screen',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = HomeScreen;
