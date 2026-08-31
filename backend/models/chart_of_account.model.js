// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const ChartOfAccountType = require('./chart_of_account_type.model');
// const ChartOfAccountSubType = require('./chart_of_account_sub_type.model');

// const ChartOfAccount = sequelize.define('ChartOfAccount', {
//   id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
//   name: { type: DataTypes.STRING(191), allowNull: false },
//   code: { type: DataTypes.STRING(191), allowNull: false },
//   type: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }, // FK → chart_of_account_types
//   sub_type: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }, // FK → chart_of_account_sub_types
//   parent: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, defaultValue: 0 },
//   is_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
//   description: { type: DataTypes.TEXT, allowNull: true },
//   created_by: { type: DataTypes.INTEGER, allowNull: false },
//   created_at: { type: DataTypes.DATE, allowNull: true },
//   updated_at: { type: DataTypes.DATE, allowNull: true },
// }, {
//   tableName: 'chart_of_accounts',
//   timestamps: false,
// });

// // Associations
// ChartOfAccount.belongsTo(ChartOfAccountType, { foreignKey: 'type', as: 'accountType' });
// ChartOfAccount.belongsTo(ChartOfAccountSubType, { foreignKey: 'sub_type', as: 'accountSubType' });

// module.exports = ChartOfAccount;



const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const ChartOfAccount = sequelize.define('ChartOfAccount', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(191), allowNull: false },
  code: { type: DataTypes.STRING(191), allowNull: false },
  type: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  sub_type: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  parent: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, defaultValue: 0 },
  is_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'chart_of_accounts',
  timestamps: false,
});

module.exports = ChartOfAccount;
