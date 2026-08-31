// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const JournalItem = require('./journalItem.model');

// const JournalEntry = sequelize.define('JournalEntry', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false,
//   },
//   reference: {
//     type: DataTypes.STRING(191),
//     allowNull: true,
//   },
//   description: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
//   journal_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   created_by: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
// }, {
//   tableName: 'journal_entries',
//   timestamps: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at',
// });

// // Associations
// JournalEntry.hasMany(JournalItem, {
//   foreignKey: 'journal',
//   sourceKey: 'id',
//   as: 'accounts',
// });

// JournalItem.belongsTo(JournalEntry, {
//   foreignKey: 'journal',
//   targetKey: 'id',
//   as: 'journalEntry',
// });

// // Instance methods (equivalent to Laravel's totalCredit and totalDebit)
// JournalEntry.prototype.totalCredit = async function () {
//   const accounts = await this.getAccounts();
//   return accounts.reduce((sum, acc) => sum + parseFloat(acc.credit || 0), 0);
// };

// JournalEntry.prototype.totalDebit = async function () {
//   const accounts = await this.getAccounts();
//   return accounts.reduce((sum, acc) => sum + parseFloat(acc.debit || 0), 0);
// };

// module.exports = JournalEntry;
