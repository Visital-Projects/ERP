const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const ChartOfAccount = require('./chart_of_account.model');

const JournalItem = sequelize.define('JournalItem', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  journal: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  account: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  debit: {
    type: DataTypes.DECIMAL(16, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  credit: {
    type: DataTypes.DECIMAL(16, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
}, {
  tableName: 'journal_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Associations
JournalItem.hasOne(ChartOfAccount, {
  foreignKey: 'id',
  sourceKey: 'account',
  as: 'accounts',
});

ChartOfAccount.belongsTo(JournalItem, {
  foreignKey: 'account',
  targetKey: 'id',
  as: 'journalItem',
});

module.exports = JournalItem;
