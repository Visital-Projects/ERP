const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const ModelHasPermission = sequelize.define('ModelHasPermission', {
  permission_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true
  },
  model_type: {
    type: DataTypes.STRING(191),
    primaryKey: true
  },
  model_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true
  }
}, {
  tableName: 'model_has_permissions',
  timestamps: false
});

module.exports = ModelHasPermission;
