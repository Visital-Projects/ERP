
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./user.model');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  is_required: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  deleted_at: {   // 🔹 Added for soft delete
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },

}, {
      tableName: 'documents',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',   // 🔹 tell sequelize which column to use
      paranoid: true,            // 🔹 enable soft delete

      underscored: true

});

Document.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = Document;
