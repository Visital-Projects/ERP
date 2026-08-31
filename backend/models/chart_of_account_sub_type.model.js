const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const ChartOfAccountType = require('./chart_of_account_type.model');

const ChartOfAccountSubType = sequelize.define('ChartOfAccountSubType', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(191), allowNull: true },
  type: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }, // foreign key to ChartOfAccountType
  created_by: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'chart_of_account_sub_types',
  timestamps: false,
});

// Association: each sub-type belongs to a type
ChartOfAccountSubType.belongsTo(ChartOfAccountType, { foreignKey: 'type', as: 'accountType' });

module.exports = ChartOfAccountSubType;
